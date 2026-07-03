#!/bin/bash
sed -i 's/whatsappNumber: '\'''\'', promoBannerUrl: '\'''\'', clientReviewUrl: '\'''\''/whatsappNumber: '\'''\'', promoBannerUrl: '\'''\'', clientReviewUrl: '\'''\'', telegramBotToken: '\'''\'', telegramChatId: '\'''\''/g' src/pages/admin/Dashboard.tsx
sed -i 's/clientReviewUrl: data.clientReviewUrl || '\'''\''/clientReviewUrl: data.clientReviewUrl || '\'''\'',\n            telegramBotToken: data.telegramBotToken || '\'''\'',\n            telegramChatId: data.telegramChatId || '\'''\''/g' src/pages/admin/Dashboard.tsx

# Find the location of clientReviewUrl input and insert Telegram inputs after it
