<?php
namespace App\Enums;

enum PaymentMethod: string {
    case Cash        = 'cash';
    case Transfer    = 'transfer';
    case QRIS        = 'qris';
    case Midtrans    = 'midtrans';
    case Downpayment = 'downpayment';
}
