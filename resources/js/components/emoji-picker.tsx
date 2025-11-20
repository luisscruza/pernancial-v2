import { Button } from '@/components/ui/button';
import { EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch, EmojiPicker as EmojiPickerUI } from '@/components/ui/emoji-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

interface EmojiPickerProps {
    value: string;
    onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-20 w-20 text-4xl" type="button">
                    {value}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0" align="start">
                <EmojiPickerUI
                    onEmojiSelect={(emoji) => {
                        onChange(emoji.emoji);
                        setOpen(false);
                    }}
                >
                    <EmojiPickerSearch placeholder="Buscar emoji..." />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPickerUI>
            </PopoverContent>
        </Popover>
    );
}
