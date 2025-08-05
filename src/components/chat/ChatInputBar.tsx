import React, { Dispatch, SetStateAction, FormEvent } from 'react';

interface ChatInputBarProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  isLoading: boolean;
}

export default function ChatInputBar({
  input,
  setInput,
  handleSubmit,
  isLoading,
}: ChatInputBarProps) {
  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 rounded-lg border border-border-color px-4 py-2 bg-element-bg focus:outline-none focus:ring-2 focus:ring-accent-blue-default"
        placeholder="Posez votre question..."
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 rounded-lg bg-accent-blue-default text-white hover:bg-accent-blue-dark disabled:bg-gray-300"
      >
        Envoyer
      </button>
    </form>
  );
}
