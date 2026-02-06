import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { useStream } from '@laravel/stream-react';
import { LoaderCircle, MessageSquare, Pencil, Plus, SendHorizontal, StopCircle, Trash2 } from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type ChatMessageRole = 'user' | 'assistant';

interface ChatMessage {
    id: number;
    role: ChatMessageRole;
    content: string;
}

interface ChatHistoryMessage {
    role: ChatMessageRole;
    content: string;
}

interface ChatConversation {
    id: string;
    title: string;
    preview: string;
    updatedAt: string;
    messageCount: number;
}

interface ChatSection {
    heading?: string;
    bullets: string[];
    paragraphs: string[];
}

interface FinanceChatPageProps {
    conversations?: ChatConversation[];
    activeConversationId?: string | null;
    initialMessages?: ChatHistoryMessage[];
}

const chatPageEndpoint = '/finance/chat';
const streamEndpoint = '/finance/chat/stream';
const resetEndpoint = '/finance/chat/reset';

function conversationEndpoint(conversationId: string): string {
    return `/finance/chat/${conversationId}`;
}

function resolveCsrfToken(): string | undefined {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const token = document.querySelector('meta[name="csrf-token"]');

    if (!token) {
        return undefined;
    }

    return token.getAttribute('content') ?? undefined;
}

function renderInlineMarkdown(content: string): ReactNode[] {
    const parts: ReactNode[] = [];
    const tokenPattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let tokenIndex = 0;

    for (const match of content.matchAll(tokenPattern)) {
        const token = match[0];
        const startIndex = match.index ?? 0;

        if (startIndex > lastIndex) {
            parts.push(content.slice(lastIndex, startIndex));
        }

        if (token.startsWith('`') && token.endsWith('`')) {
            parts.push(
                <code key={`code-${tokenIndex}`} className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.8125rem]">
                    {token.slice(1, -1)}
                </code>,
            );
        } else if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(
                <strong key={`strong-${tokenIndex}`} className="font-semibold">
                    {token.slice(2, -2)}
                </strong>,
            );
        } else if (token.startsWith('*') && token.endsWith('*')) {
            parts.push(
                <strong key={`strong-${tokenIndex}`} className="font-semibold">
                    {token.slice(1, -1)}
                </strong>,
            );
        }

        lastIndex = startIndex + token.length;
        tokenIndex += 1;
    }

    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return parts;
}

function parseMarkdownSections(content: string): ChatSection[] {
    const lines = content.split('\n');
    const sections: ChatSection[] = [];
    let currentSection: ChatSection = { bullets: [], paragraphs: [] };

    const pushSection = (): void => {
        if (currentSection.heading || currentSection.bullets.length > 0 || currentSection.paragraphs.length > 0) {
            sections.push(currentSection);
        }

        currentSection = { bullets: [], paragraphs: [] };
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (line === '') {
            continue;
        }

        const headingMatch = line.match(/^\*(.+)\*$/);

        if (headingMatch) {
            pushSection();
            currentSection.heading = headingMatch[1].trim();
            continue;
        }

        if (line.startsWith('- ')) {
            currentSection.bullets.push(line.slice(2).trim());
            continue;
        }

        currentSection.paragraphs.push(line);
    }

    pushSection();

    return sections;
}

function MarkdownMessage({ content }: { content: string }) {
    const sections = parseMarkdownSections(content);

    if (sections.length === 0) {
        return <p className="whitespace-pre-wrap">{content}</p>;
    }

    return (
        <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
                <div key={`section-${sectionIndex}`} className="space-y-2">
                    {section.heading && <p className="text-foreground text-sm font-semibold">{section.heading}</p>}

                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={`paragraph-${sectionIndex}-${paragraphIndex}`} className="text-sm leading-relaxed whitespace-pre-wrap">
                            {renderInlineMarkdown(paragraph)}
                        </p>
                    ))}

                    {section.bullets.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
                            {section.bullets.map((bullet, bulletIndex) => (
                                <li key={`bullet-${sectionIndex}-${bulletIndex}`}>{renderInlineMarkdown(bullet)}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}

function formatConversationTimestamp(value: string): string {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return 'Ahora';
    }

    return parsed.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
    });
}

export default function FinanceChatPage({ conversations = [], activeConversationId = null, initialMessages = [] }: FinanceChatPageProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [streamingReply, setStreamingReply] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(activeConversationId);
    const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    const streamBufferRef = useRef('');
    const streamEventBufferRef = useRef('');
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const nextMessageIdRef = useRef(1);
    const csrfToken = useMemo(() => resolveCsrfToken(), []);

    useEffect(() => {
        setMessages(
            initialMessages.map((message, index) => ({
                id: index + 1,
                role: message.role,
                content: message.content,
            })),
        );

        nextMessageIdRef.current = initialMessages.length + 1;
    }, [initialMessages]);

    useEffect(() => {
        setSelectedConversationId(activeConversationId ?? null);
    }, [activeConversationId]);

    const appendMessage = (role: ChatMessageRole, content: string): void => {
        setMessages((currentMessages) => [
            ...currentMessages,
            {
                id: nextMessageIdRef.current++,
                role,
                content,
            },
        ]);
    };

    const applyStreamChunk = (chunk: string): void => {
        streamEventBufferRef.current = `${streamEventBufferRef.current}${chunk}`;

        const events = streamEventBufferRef.current.split('\n\n');
        streamEventBufferRef.current = events.pop() ?? '';

        for (const eventBlock of events) {
            const dataPayload = eventBlock
                .split('\n')
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.replace(/^data:\s?/, ''))
                .join('\n')
                .trim();

            if (dataPayload === '' || dataPayload === '[DONE]') {
                continue;
            }

            try {
                const event = JSON.parse(dataPayload) as { type?: string; delta?: string };

                if (event.type === 'text_delta' && typeof event.delta === 'string') {
                    streamBufferRef.current = `${streamBufferRef.current}${event.delta}`;
                    setStreamingReply(streamBufferRef.current);
                }
            } catch {}
        }
    };

    const { send, cancel, isFetching, isStreaming } = useStream<{ message: string; conversation_id?: string }>(streamEndpoint, {
        csrfToken,
        onResponse: () => {
            streamBufferRef.current = '';
            streamEventBufferRef.current = '';
            setStreamingReply('');
            setErrorMessage(null);
        },
        onData: (chunk) => {
            applyStreamChunk(chunk);
        },
        onFinish: () => {
            if (streamEventBufferRef.current !== '') {
                applyStreamChunk('\n\n');
            }

            const response = streamBufferRef.current.trim();

            streamBufferRef.current = '';
            streamEventBufferRef.current = '';
            setStreamingReply('');

            if (response === '') {
                setErrorMessage('No pude generar una respuesta. Intenta de nuevo.');

                return;
            }

            appendMessage('assistant', response);

            router.get(chatPageEndpoint, selectedConversationId ? { conversation: selectedConversationId } : {}, {
                only: ['conversations', 'activeConversationId'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        onError: () => {
            streamBufferRef.current = '';
            streamEventBufferRef.current = '';
            setStreamingReply('');
            setErrorMessage('No pude completar la respuesta en streaming. Intenta de nuevo.');
        },
    });

    useEffect(() => {
        if (!scrollContainerRef.current) {
            return;
        }

        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }, [messages, streamingReply, isStreaming]);

    const canSend = draft.trim().length > 0 && !isFetching && !isStreaming && !isCreatingConversation;
    const hasPendingStream = isStreaming || streamingReply !== '';

    const submitMessage = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const message = draft.trim();

        if (message === '') {
            return;
        }

        appendMessage('user', message);
        setDraft('');
        setErrorMessage(null);

        send({
            message,
            ...(selectedConversationId ? { conversation_id: selectedConversationId } : {}),
        });
    };

    const openConversation = (conversationId: string): void => {
        if (isStreaming) {
            cancel();
        }

        router.get(
            chatPageEndpoint,
            { conversation: conversationId },
            {
                preserveState: false,
                preserveScroll: true,
            },
        );
    };

    const startNewConversation = async (): Promise<void> => {
        if (isStreaming) {
            cancel();
        }

        setIsCreatingConversation(true);
        setErrorMessage(null);

        try {
            await fetch(resetEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                credentials: 'same-origin',
                body: '{}',
            });

            router.get(
                chatPageEndpoint,
                {},
                {
                    preserveState: false,
                    preserveScroll: true,
                },
            );
        } catch {
            setErrorMessage('No pude iniciar un nuevo chat. Intenta de nuevo.');
        } finally {
            setIsCreatingConversation(false);
        }
    };

    const renameConversation = async (conversation: ChatConversation): Promise<void> => {
        const nextTitle = window.prompt('Nuevo titulo del chat', conversation.title)?.trim();

        if (!nextTitle) {
            return;
        }

        setPendingConversationId(conversation.id);
        setErrorMessage(null);

        try {
            const response = await fetch(conversationEndpoint(conversation.id), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ title: nextTitle }),
            });

            if (!response.ok) {
                throw new Error('Rename failed');
            }

            router.get(chatPageEndpoint, selectedConversationId ? { conversation: selectedConversationId } : {}, {
                only: ['conversations'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        } catch {
            setErrorMessage('No pude renombrar este chat. Intenta de nuevo.');
        } finally {
            setPendingConversationId(null);
        }
    };

    const deleteConversation = async (conversation: ChatConversation): Promise<void> => {
        const shouldDelete = window.confirm(`Eliminar chat "${conversation.title}"?`);

        if (!shouldDelete) {
            return;
        }

        setPendingConversationId(conversation.id);
        setErrorMessage(null);

        try {
            const response = await fetch(conversationEndpoint(conversation.id), {
                method: 'DELETE',
                headers: {
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            if (selectedConversationId === conversation.id) {
                router.get(
                    chatPageEndpoint,
                    {},
                    {
                        preserveState: false,
                        preserveScroll: true,
                    },
                );
            } else {
                router.get(chatPageEndpoint, selectedConversationId ? { conversation: selectedConversationId } : {}, {
                    only: ['conversations'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        } catch {
            setErrorMessage('No pude eliminar este chat. Intenta de nuevo.');
        } finally {
            setPendingConversationId(null);
        }
    };

    return (
        <AppLayout title="Asistente financiero">
            <Head title="Asistente financiero" />

            <div className="flex h-[calc(100dvh-4rem)] w-full flex-1 gap-4 overflow-hidden p-4 md:p-6">
                <aside className="border-border/70 bg-card hidden w-80 shrink-0  overflow-hidden rounded-3xl border shadow-sm md:sticky md:top-0 md:flex md:h-full md:min-h-[90vh] md:flex-col">
                    <div className="border-border/70 border-b p-3">
                        <Button className="w-full justify-start" onClick={startNewConversation} disabled={isCreatingConversation}>
                            <Plus className="h-4 w-4" />
                            {isCreatingConversation ? 'Creando chat...' : 'Nuevo chat'}
                        </Button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-2">
                        {conversations.length === 0 ? (
                            <div className="text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">Aun no tienes chats previos.</div>
                        ) : (
                            conversations.map((conversation) => {
                                const isActive = selectedConversationId === conversation.id;
                                const isPending = pendingConversationId === conversation.id;

                                return (
                                    <div
                                        key={conversation.id}
                                        className={cn(
                                            'group border-border/70 rounded-2xl border px-3 py-2',
                                            isActive ? 'bg-muted/60' : 'bg-background hover:bg-muted/40',
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openConversation(conversation.id)}
                                                className="min-w-0 flex-1 text-left"
                                            >
                                                <p className="truncate text-sm font-medium">{conversation.title || 'Chat sin titulo'}</p>
                                                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                                    {conversation.preview || 'Sin mensajes recientes'}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[11px]">
                                                    {formatConversationTimestamp(conversation.updatedAt)} - {conversation.messageCount} mensajes
                                                </p>
                                            </button>

                                            <div className="flex items-center gap-1 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    disabled={isPending}
                                                    onClick={() => renameConversation(conversation)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    disabled={isPending}
                                                    onClick={() => deleteConversation(conversation)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                    <div className="md:hidden">
                        <div className="border-border/70 bg-card flex items-center gap-2 overflow-x-auto rounded-2xl border p-2">
                            <Button variant="outline" size="sm" onClick={startNewConversation} disabled={isCreatingConversation}>
                                <Plus className="h-4 w-4" />
                                Nuevo
                            </Button>

                            {conversations.map((conversation) => (
                                <Button
                                    key={conversation.id}
                                    type="button"
                                    variant={selectedConversationId === conversation.id ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="max-w-48 truncate"
                                    onClick={() => openConversation(conversation.id)}
                                >
                                    {conversation.title}
                                </Button>
                            ))}
                        </div>
                    </div>



                    <div className="border-border/60 bg-card flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border shadow-sm">
                        <div ref={scrollContainerRef} className="flex-1 space-y-4 overflow-x-hidden max-h-[70vh] overflow-y-auto overscroll-contain p-4 md:p-6">
                            {messages.length === 0 && !hasPendingStream && (
                                <div className="border-border/80 bg-muted/20 text-muted-foreground rounded-2xl border border-dashed p-6 text-sm">
                                    Prueba con frases como "Registra un gasto de 15 por cafe en Efectivo" o "Cuanto gaste en comida este mes".
                                </div>
                            )}

                            {messages.map((message) => (
                                <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div
                                        className={cn(
                                            'max-w-[95%] overflow-x-auto rounded-2xl px-4 py-3 text-sm md:max-w-[80%]',
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'border-border/70 bg-muted/40 text-foreground border',
                                        )}
                                    >
                                        {message.role === 'assistant' ? (
                                            <MarkdownMessage content={message.content} />
                                        ) : (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {hasPendingStream && (
                                <div className="flex justify-start">
                                    <div className="border-border/70 bg-muted/40 max-w-[95%] rounded-2xl border px-4 py-3 text-sm md:max-w-[80%]">
                                        {streamingReply !== '' ? (
                                            <p className="whitespace-pre-wrap">{streamingReply}</p>
                                        ) : (
                                            <div className="text-muted-foreground flex items-center gap-2">
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Generando respuesta...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-border/70 bg-background/90 border-t p-4 md:p-5 ">
                            {errorMessage && <p className="text-destructive mb-3 text-sm">{errorMessage}</p>}

                            <form onSubmit={submitMessage} className="space-y-3">
                                <Textarea
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                    rows={3}
                                    placeholder=""
                                    disabled={isFetching || isStreaming || isCreatingConversation}
                                    maxLength={4000}
                                />

                                <div className="flex items-center justify-end gap-2">
                                    {isStreaming && (
                                        <Button type="button" variant="outline" onClick={cancel}>
                                            <StopCircle className="h-4 w-4" />
                                            Detener
                                        </Button>
                                    )}

                                    <Button type="submit" disabled={!canSend}>
                                        <SendHorizontal className="h-4 w-4" />
                                        Enviar
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
