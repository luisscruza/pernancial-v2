<?php

declare(strict_types=1);

namespace App\Mcp\Servers;

use App\Mcp\Resources\AccountsResource;
use App\Mcp\Resources\CategoriesResource;
use App\Mcp\Resources\TransactionsResource;
use App\Mcp\Tools\CreateTransactionTool;
use App\Mcp\Tools\GetAccountsTool;
use App\Mcp\Tools\GetCategoriesTool;
use Laravel\Mcp\Server;

final class PernancialServer extends Server
{
    /**
     * The MCP server's name.
     */
    protected string $name = 'Pernancial Financial Management';

    /**
     * The MCP server's version.
     */
    protected string $version = '1.0.0';

    /**
     * The MCP server's instructions for the LLM.
     */
    protected string $instructions = <<<'MARKDOWN'
        # Pernancial Financial Management MCP Server

        This server provides AI tools and resources for managing personal finances within the Pernancial application.

        ## Available Tools

        ### CreateTransactionTool
        - **Purpose**: Create financial transactions (income, expense, or transfer)
        - **Usage**: Specify type, amount, transaction_date, account_id, and optional category_id or destination_account_id
        - **Validation**: Automatically validates account ownership, category assignment, and transfer requirements
        - **Notes**: For transfers, destination_account_id is required. All accounts and categories must belong to the authenticated user.

        ## Available Resources

        ### AccountsResource (pernancial://resources/accounts)
        - **Purpose**: Retrieve user's accounts with balances and currency information
        - **Data**: Account ID, name, type, currency details, current balance
        - **Usage**: Use this to get account IDs before creating transactions

        ### CategoriesResource (pernancial://resources/categories)
        - **Purpose**: Retrieve user's transaction categories
        - **Data**: Category ID, name, type (income/expense), description
        - **Usage**: Use this to get category IDs for transaction categorization

        ### TransactionsResource (pernancial://resources/transactions)
        - **Purpose**: Retrieve recent transactions (last 50)
        - **Data**: Transaction details including type, amount, date, account, category, and destination account
        - **Usage**: Use this to understand spending patterns and recent financial activity


        ## Transaction Types

        - **income**: Money coming into an account
        - **expense**: Money going out of an account
        - **transfer**: Money moving between two accounts (creates transfer_out and transfer_in records)

        ## Best Practices

        1. Always check available accounts and categories using resources before creating transactions
        2. Verify account IDs exist.
        3. For transfers, ensure both source and destination accounts are different
        4. Use descriptive transaction descriptions to help with categorization
        5. Use proper date formats (YYYY-MM-DD) for transaction dates
    MARKDOWN;

    /**
     * The tools registered with this MCP server.
     *
     * @var array<int, class-string<Server\Tool>>
     */
    protected array $tools = [
        CreateTransactionTool::class,
        GetAccountsTool::class,
        GetCategoriesTool::class,
    ];

    /**
     * The resources registered with this MCP server.
     *
     * @var array<int, class-string<Server\Resource>>
     */
    protected array $resources = [
        AccountsResource::class,
        CategoriesResource::class,
        TransactionsResource::class,
    ];

    /**
     * The prompts registered with this MCP server.
     *
     * @var array<int, class-string<Server\Prompt>>
     */
    protected array $prompts = [
        //
    ];
}
