<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schedule;

Schedule::command('receivables:generate')->daily();
Schedule::command('payables:generate')->daily();
