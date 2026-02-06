<?php

declare(strict_types=1);

namespace App\Ai\Agents;

use App\Ai\Tools\CreateFinanceTransactionTool;
use App\Ai\Tools\ListFinanceAccountsTool;
use App\Ai\Tools\ListFinanceCategoriesTool;
use App\Models\User;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Promptable;
use Stringable;

#[MaxSteps(8)]
final class FinanceAgent implements Agent, Conversational, HasTools
{
    use Promptable;
    use RemembersConversations;

    public function __construct(private User $user) {}

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'PROMPT'
            You are a finance assistant for a personal finance app.

            Your goals:
            - Help the user track transactions accurately.
            - Ask short clarifying questions when transaction data is missing.
            - Be concise and practical.

            Rules:
            - Never invent account IDs or category IDs.
            - Before creating a transaction, call tools to find matching accounts/categories.
            - For income and expense transactions, category is required.
            - For transfer transactions, destination account is required and must be different from source.
            - If the user message is casual and not an action request, respond normally without creating transactions.
            - Reply in the same language as the user.
            PROMPT;
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new ListFinanceAccountsTool($this->user),
            new ListFinanceCategoriesTool($this->user),
            new CreateFinanceTransactionTool($this->user),
        ];
    }
}
