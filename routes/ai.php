<?php

declare(strict_types=1);

use App\Mcp\Servers\PernancialServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/pernancial', PernancialServer::class)->middleware('auth:sanctum');
