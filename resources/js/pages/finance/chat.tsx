import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { useStream } from '@laravel/stream-react';
import { LoaderCircle, Pencil, Plus, SendHorizontal, StopCircle, Trash2 } from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type ChatMessageRole = 'user' | 'assistant';

type ChartKind = 'bar' | 'line' | 'stacked_bar';

interface ChartSeries {
    key: string;
    label: string;
    color?: string;
}

interface ChartPoint {
    label: string;
    [key: string]: string | number | null;
}

interface ChartPayload {
    version?: number;
    kind: ChartKind;
    title: string;
    subtitle?: string;
    xAxis?: {
        key?: string;
        label?: string;
    };
    series: ChartSeries[];
    points: ChartPoint[];
    table?: Array<Record<string, string | number | null>>;
    csv?: string;
}

interface ChatMessage {
    id: number;
    role: ChatMessageRole;
    content: string;
    charts: ChartPayload[];
}

interface ChatHistoryMessage {
    role: ChatMessageRole;
    content: string;
    charts?: ChartPayload[];
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

interface StreamDebugSnapshot {
    eventCounts: Record<string, number>;
    toolCalls: string[];
    chartToolMessages: string[];
    errors: string[];
    parseErrors: number;
}

const chatPageEndpoint = '/finance/chat';
const streamEndpoint = '/finance/chat/stream';
const resetEndpoint = '/finance/chat/reset';

function conversationEndpoint(conversationId: string): string {
    return `/finance/chat/${conversationId}`;
}

function createEmptyStreamDebugSnapshot(): StreamDebugSnapshot {
    return {
        eventCounts: {},
        toolCalls: [],
        chartToolMessages: [],
        errors: [],
        parseErrors: 0,
    };
}

function resolveCsrfToken(): string | undefined {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const token = document.querySelector('meta[name="csrf-token"]');

    if (!token) {
        const cookieToken = document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        if (!cookieToken) {
            return undefined;
        }

        return decodeURIComponent(cookieToken);
    }

    return token.getAttribute('content') ?? undefined;
}

function toNumberValue(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return 0;
}

function formatChartValue(value: number): string {
    return value.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeChartPayload(value: unknown): ChartPayload | null {
    if (!isPlainObject(value)) {
        return null;
    }

    if (value.kind !== 'bar' && value.kind !== 'line' && value.kind !== 'stacked_bar') {
        return null;
    }

    if (!Array.isArray(value.series) || !Array.isArray(value.points)) {
        return null;
    }

    const series = value.series
        .filter(isPlainObject)
        .map((item) => ({
            key: String(item.key ?? ''),
            label: String(item.label ?? ''),
            color: typeof item.color === 'string' ? item.color : undefined,
        }))
        .filter((item) => item.key !== '' && item.label !== '');

    if (series.length === 0) {
        return null;
    }

    const points = value.points
        .filter(isPlainObject)
        .map((point) => {
            const normalized: ChartPoint = {
                label: String(point.label ?? ''),
            };

            for (const [key, pointValue] of Object.entries(point)) {
                if (key === 'label') {
                    continue;
                }

                if (typeof pointValue === 'number' || typeof pointValue === 'string' || pointValue === null) {
                    normalized[key] = pointValue;
                }
            }

            return normalized;
        })
        .filter((point) => point.label !== '');

    return {
        version: typeof value.version === 'number' ? value.version : undefined,
        kind: value.kind,
        title: String(value.title ?? 'Grafico'),
        subtitle: typeof value.subtitle === 'string' ? value.subtitle : undefined,
        xAxis: isPlainObject(value.xAxis)
            ? {
                  key: typeof value.xAxis.key === 'string' ? value.xAxis.key : undefined,
                  label: typeof value.xAxis.label === 'string' ? value.xAxis.label : undefined,
              }
            : undefined,
        series,
        points,
        table: Array.isArray(value.table)
            ? value.table.filter(isPlainObject).map((row) => {
                  const normalizedRow: Record<string, string | number | null> = {};

                  for (const [key, rowValue] of Object.entries(row)) {
                      if (typeof rowValue === 'number' || typeof rowValue === 'string' || rowValue === null) {
                          normalizedRow[key] = rowValue;
                      }
                  }

                  return normalizedRow;
              })
            : undefined,
        csv: typeof value.csv === 'string' ? value.csv : undefined,
    };
}

function parseChartPayloads(raw: unknown): ChartPayload[] {
    let source = raw;

    if (typeof source === 'string') {
        try {
            source = JSON.parse(source) as unknown;
        } catch {
            return [];
        }
    }

    if (Array.isArray(source)) {
        return source.map(normalizeChartPayload).filter((chart): chart is ChartPayload => chart !== null);
    }

    const chart = normalizeChartPayload(source);

    return chart ? [chart] : [];
}

function chartSignature(chart: ChartPayload): string {
    return `${chart.kind}:${chart.title}:${chart.series.map((series) => series.key).join('|')}:${chart.points.length}`;
}

function mergeChartPayloads(currentCharts: ChartPayload[], nextCharts: ChartPayload[]): ChartPayload[] {
    const signatures = new Set(currentCharts.map((chart) => chartSignature(chart)));
    const merged = [...currentCharts];

    for (const chart of nextCharts) {
        const signature = chartSignature(chart);

        if (signatures.has(signature)) {
            continue;
        }

        signatures.add(signature);
        merged.push(chart);
    }

    return merged;
}

function LineChartPreview({ chart }: { chart: ChartPayload }) {
    const width = 640;
    const height = 220;
    const padding = 24;
    const pointCount = Math.max(chart.points.length, 1);
    const xStep = pointCount > 1 ? (width - padding * 2) / (pointCount - 1) : 0;
    const allValues = chart.points.flatMap((point) => chart.series.map((series) => toNumberValue(point[series.key])));
    const maxValue = Math.max(1, ...allValues);

    return (
        <div className="space-y-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="bg-muted/30 h-44 w-full rounded-lg">
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-border" strokeWidth={1.5} />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-border" strokeWidth={1.5} />

                {chart.series.map((series) => {
                    const points = chart.points
                        .map((point, index) => {
                            const value = toNumberValue(point[series.key]);
                            const x = padding + index * xStep;
                            const y = height - padding - (value / maxValue) * (height - padding * 2);

                            return `${x},${y}`;
                        })
                        .join(' ');

                    return (
                        <polyline
                            key={`line-${series.key}`}
                            points={points}
                            fill="none"
                            stroke={series.color ?? '#2563eb'}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    );
                })}
            </svg>

            <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                {chart.points.map((point) => (
                    <span key={`line-label-${point.label}`}>{point.label}</span>
                ))}
            </div>
        </div>
    );
}

function BarChartPreview({ chart }: { chart: ChartPayload }) {
    if (chart.points.length === 0) {
        return <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">Sin datos para este periodo.</div>;
    }

    const maxValue =
        chart.kind === 'stacked_bar'
            ? Math.max(1, ...chart.points.map((point) => chart.series.reduce((sum, series) => sum + toNumberValue(point[series.key]), 0)))
            : Math.max(1, ...chart.points.flatMap((point) => chart.series.map((series) => toNumberValue(point[series.key]))));

    return (
        <div className="space-y-3">
            {chart.points.map((point) => (
                <div key={`bar-row-${point.label}`} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium">{point.label}</span>
                    </div>

                    {chart.kind === 'stacked_bar' ? (
                        <div className="bg-muted/30 flex h-3 overflow-hidden rounded-full">
                            {chart.series.map((series) => {
                                const value = toNumberValue(point[series.key]);
                                const width = Math.max(0, (value / maxValue) * 100);

                                return (
                                    <div
                                        key={`bar-segment-${point.label}-${series.key}`}
                                        style={{ width: `${width}%`, backgroundColor: series.color ?? '#2563eb' }}
                                        title={`${series.label}: ${formatChartValue(value)}`}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {chart.series.map((series) => {
                                const value = toNumberValue(point[series.key]);
                                const width = Math.max(0, (value / maxValue) * 100);

                                return (
                                    <div key={`bar-cell-${point.label}-${series.key}`} className="flex items-center gap-2">
                                        <span className="text-muted-foreground w-20 truncate text-[11px]">{series.label}</span>
                                        <div className="bg-muted/30 h-2.5 flex-1 overflow-hidden rounded-full">
                                            <div
                                                style={{ width: `${width}%`, backgroundColor: series.color ?? '#2563eb' }}
                                                className="h-full rounded-full"
                                            />
                                        </div>
                                        <span className="text-muted-foreground min-w-14 text-right text-[11px]">{formatChartValue(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function ChartTablePreview({ chart }: { chart: ChartPayload }) {
    if (!chart.table || chart.table.length === 0) {
        return null;
    }

    const headers = Object.keys(chart.table[0] ?? {});

    if (headers.length === 0) {
        return null;
    }

    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-96 text-xs">
                <thead className="bg-muted/40">
                    <tr>
                        {headers.map((header) => (
                            <th key={`header-${header}`} className="px-2 py-1.5 text-left font-medium">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {chart.table.map((row, index) => (
                        <tr key={`row-${index}`} className="border-t">
                            {headers.map((header) => (
                                <td key={`cell-${index}-${header}`} className="px-2 py-1.5">
                                    {typeof row[header] === 'number' ? formatChartValue(row[header]) : String(row[header] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FinanceChartCard({ chart }: { chart: ChartPayload }) {
    return (
        <div className="border-border/70 bg-background/80 space-y-3 rounded-xl border p-3">
            <div>
                <p className="text-sm font-semibold">{chart.title}</p>
                {chart.subtitle && <p className="text-muted-foreground mt-0.5 text-xs">{chart.subtitle}</p>}
            </div>

            {chart.kind === 'line' ? <LineChartPreview chart={chart} /> : <BarChartPreview chart={chart} />}

            <ChartTablePreview chart={chart} />

            {chart.csv && (
                <details className="text-xs">
                    <summary className="text-muted-foreground cursor-pointer">CSV</summary>
                    <pre className="bg-muted/30 mt-2 max-h-36 overflow-auto rounded p-2 font-mono text-[11px] leading-relaxed">{chart.csv}</pre>
                </details>
            )}
        </div>
    );
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
    const [streamingCharts, setStreamingCharts] = useState<ChartPayload[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [lastStreamDebug, setLastStreamDebug] = useState<StreamDebugSnapshot | null>(null);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(activeConversationId);
    const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    const streamBufferRef = useRef('');
    const streamEventBufferRef = useRef('');
    const streamChartBufferRef = useRef<ChartPayload[]>([]);
    const streamChartToolMessageBufferRef = useRef<string[]>([]);
    const streamDebugRef = useRef<StreamDebugSnapshot>(createEmptyStreamDebugSnapshot());
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const nextMessageIdRef = useRef(1);
    const csrfToken = useMemo(() => resolveCsrfToken(), []);

    useEffect(() => {
        setMessages(
            initialMessages.map((message, index) => ({
                id: index + 1,
                role: message.role,
                content: message.content,
                charts: parseChartPayloads(message.charts ?? []),
            })),
        );

        nextMessageIdRef.current = initialMessages.length + 1;
    }, [initialMessages]);

    useEffect(() => {
        setSelectedConversationId(activeConversationId ?? null);
    }, [activeConversationId]);

    const appendMessage = (role: ChatMessageRole, content: string, charts: ChartPayload[] = []): void => {
        setMessages((currentMessages) => [
            ...currentMessages,
            {
                id: nextMessageIdRef.current++,
                role,
                content,
                charts,
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
                const event = JSON.parse(dataPayload) as {
                    type?: string;
                    delta?: string;
                    message?: string;
                    errorText?: string;
                    tool_name?: string;
                    arguments?: unknown;
                    result?: unknown;
                };

                const eventType = typeof event.type === 'string' && event.type !== '' ? event.type : 'unknown';

                streamDebugRef.current.eventCounts[eventType] = (streamDebugRef.current.eventCounts[eventType] ?? 0) + 1;

                if (event.type === 'text_delta' && typeof event.delta === 'string') {
                    streamBufferRef.current = `${streamBufferRef.current}${event.delta}`;
                    setStreamingReply(streamBufferRef.current);
                }

                if (event.type === 'tool_call' && typeof event.tool_name === 'string') {
                    streamDebugRef.current.toolCalls = [...streamDebugRef.current.toolCalls, event.tool_name];

                    if (import.meta.env.DEV) {
                        console.debug('[finance-chat] tool_call', {
                            tool: event.tool_name,
                            arguments: event.arguments,
                        });
                    }
                }

                if (event.type === 'tool_result' && event.tool_name === 'GenerateFinanceChartTool') {
                    const charts = parseChartPayloads(event.result);

                    if (charts.length > 0) {
                        streamChartBufferRef.current = mergeChartPayloads(streamChartBufferRef.current, charts);
                        setStreamingCharts(streamChartBufferRef.current);
                    }

                    if (charts.length === 0 && typeof event.result === 'string' && event.result.trim() !== '') {
                        streamChartToolMessageBufferRef.current = [...streamChartToolMessageBufferRef.current, event.result.trim()];
                        streamDebugRef.current.chartToolMessages = [...streamChartToolMessageBufferRef.current];
                    }

                    if (import.meta.env.DEV) {
                        console.debug('[finance-chat] chart_tool_result', {
                            hasCharts: charts.length > 0,
                            chartsCount: charts.length,
                            rawResultType: typeof event.result,
                        });
                    }
                }

                if (typeof event.message === 'string' && event.message.trim() !== '') {
                    streamDebugRef.current.errors = [...streamDebugRef.current.errors, event.message.trim()];
                }

                if (typeof event.errorText === 'string' && event.errorText.trim() !== '') {
                    streamDebugRef.current.errors = [...streamDebugRef.current.errors, event.errorText.trim()];
                }
            } catch {
                streamDebugRef.current.parseErrors += 1;
            }
        }
    };

    const { send, cancel, isFetching, isStreaming } = useStream<{ message: string; conversation_id?: string; _token?: string }>(streamEndpoint, {
        csrfToken,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
        onResponse: () => {
            streamBufferRef.current = '';
            streamEventBufferRef.current = '';
            streamChartBufferRef.current = [];
            streamChartToolMessageBufferRef.current = [];
            streamDebugRef.current = createEmptyStreamDebugSnapshot();
            setStreamingReply('');
            setStreamingCharts([]);
            setErrorMessage(null);
            setLastStreamDebug(null);
        },
        onData: (chunk) => {
            applyStreamChunk(chunk);
        },
        onFinish: () => {
            if (streamEventBufferRef.current !== '') {
                applyStreamChunk('\n\n');
            }

            const response = streamBufferRef.current.trim();
            const charts = streamChartBufferRef.current;
            const chartToolMessages = streamChartToolMessageBufferRef.current;
            const snapshot = {
                eventCounts: { ...streamDebugRef.current.eventCounts },
                toolCalls: [...streamDebugRef.current.toolCalls],
                chartToolMessages: [...chartToolMessages],
                errors: [...streamDebugRef.current.errors],
                parseErrors: streamDebugRef.current.parseErrors,
            };

            streamBufferRef.current = '';
            streamEventBufferRef.current = '';
            streamChartBufferRef.current = [];
            streamChartToolMessageBufferRef.current = [];
            streamDebugRef.current = createEmptyStreamDebugSnapshot();
            setStreamingReply('');
            setStreamingCharts([]);
            setLastStreamDebug(snapshot);

            if (import.meta.env.DEV) {
                console.debug('[finance-chat] stream_finish', snapshot);
            }

            if (response === '' && charts.length === 0) {
                if (chartToolMessages.length > 0) {
                    appendMessage('assistant', chartToolMessages.join('\n\n'));

                    return;
                }

                const debugHint = snapshot.errors[0] ? ` Debug: ${snapshot.errors[0]}` : '';
                setErrorMessage(`No pude generar una respuesta. Intenta de nuevo.${debugHint}`);

                return;
            }

            appendMessage('assistant', response === '' ? 'Aqui tienes el grafico solicitado.' : response, charts);

            router.get(chatPageEndpoint, selectedConversationId ? { conversation: selectedConversationId } : {}, {
                only: ['conversations', 'activeConversationId'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        onError: () => {
            const snapshot = {
                eventCounts: { ...streamDebugRef.current.eventCounts },
                toolCalls: [...streamDebugRef.current.toolCalls],
                chartToolMessages: [...streamChartToolMessageBufferRef.current],
                errors: [...streamDebugRef.current.errors],
                parseErrors: streamDebugRef.current.parseErrors,
            };

            streamBufferRef.current = '';
            streamEventBufferRef.current = '';
            streamChartBufferRef.current = [];
            streamChartToolMessageBufferRef.current = [];
            streamDebugRef.current = createEmptyStreamDebugSnapshot();
            setStreamingReply('');
            setStreamingCharts([]);
            setLastStreamDebug(snapshot);
            setErrorMessage('No pude completar la respuesta en streaming. Intenta de nuevo.');

            if (import.meta.env.DEV) {
                console.debug('[finance-chat] stream_error', snapshot);
            }
        },
    });

    useEffect(() => {
        if (!scrollContainerRef.current) {
            return;
        }

        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }, [messages, streamingReply, streamingCharts, isStreaming]);

    const canSend = draft.trim().length > 0 && !isFetching && !isStreaming && !isCreatingConversation;
    const hasPendingStream = isStreaming || streamingReply !== '' || streamingCharts.length > 0;

    const submitMessage = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const message = draft.trim();

        if (message === '') {
            return;
        }

        appendMessage('user', message);
        setDraft('');
        setErrorMessage(null);
        setLastStreamDebug(null);

        send({
            message,
            ...(selectedConversationId ? { conversation_id: selectedConversationId } : {}),
            ...(csrfToken ? { _token: csrfToken } : {}),
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
                <aside className="border-border/70 bg-card hidden w-80 shrink-0 overflow-hidden rounded-3xl border shadow-sm md:sticky md:top-0 md:flex md:h-full md:min-h-[90vh] md:flex-col">
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
                        <div
                            ref={scrollContainerRef}
                            className="max-h-[70vh] flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain p-4 md:p-6"
                        >
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
                                            <div className="space-y-3">
                                                {message.content !== '' && <MarkdownMessage content={message.content} />}

                                                {message.charts.map((chart, chartIndex) => (
                                                    <FinanceChartCard key={`chat-chart-${message.id}-${chartIndex}`} chart={chart} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {hasPendingStream && (
                                <div className="flex justify-start">
                                    <div className="border-border/70 bg-muted/40 max-w-[95%] rounded-2xl border px-4 py-3 text-sm md:max-w-[80%]">
                                        {streamingReply !== '' && <p className="whitespace-pre-wrap">{streamingReply}</p>}

                                        {streamingCharts.length > 0 && (
                                            <div className="mt-3 space-y-3">
                                                {streamingCharts.map((chart, chartIndex) => (
                                                    <FinanceChartCard key={`streaming-chart-${chartIndex}`} chart={chart} />
                                                ))}
                                            </div>
                                        )}

                                        {streamingReply === '' && streamingCharts.length === 0 && (
                                            <div className="text-muted-foreground flex items-center gap-2">
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Generando respuesta...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-border/70 bg-background/90 border-t p-4 md:p-5">
                            {errorMessage && <p className="text-destructive mb-3 text-sm">{errorMessage}</p>}

                            {errorMessage && lastStreamDebug && (
                                <details className="mb-3 rounded-lg border p-2 text-xs">
                                    <summary className="cursor-pointer font-medium">Debug stream</summary>
                                    <pre className="bg-muted/30 mt-2 max-h-40 overflow-auto rounded p-2 font-mono text-[11px] leading-relaxed">
                                        {JSON.stringify(lastStreamDebug, null, 2)}
                                    </pre>
                                </details>
                            )}

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
