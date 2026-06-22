export const getEmailTemplate = ({
  customerName,
  orderItems,
  totalPrice,
  status,
  productGmail,
  productPassword,
  customerWhatsapp,
}: {
  customerName: string;
  orderItems: string;
  totalPrice: string | number;
  status: string; // 'PENDING' | 'CONFIRMED'
  productGmail?: string;
  productPassword?: string;
  customerWhatsapp?: string;
}) => {
  const isConfirmed = status.toUpperCase() === 'CONFIRMED' || status.toUpperCase() === 'APPROVED';
  
  const emailHeading = isConfirmed ? 'Order Confirmed' : 'Order Received';
  const emailMessage = isConfirmed 
    ? 'Your order has been confirmed successfully! Below are your product access details.' 
    : 'Your order is currently PENDING. We will review it and notify you once accepted.';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; margin: 0; padding: 0; color: #cbd5e1;">
    <div style="max-width: 600px; margin: 30px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        
        <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #ef4444;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px;">
                JERRY <span style="color: #ef4444;">AUTOMATION</span>
            </h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase;">Premium Tools & Courses</p>
        </div>

        <div style="padding: 30px;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 22px; font-weight: 700;">${emailHeading}</h2>
            <p style="color: #cbd5e1; line-height: 1.6; font-size: 15px;">
                Dear <strong>${customerName}</strong>,<br>
                ${emailMessage}
            </p>

            ${isConfirmed && productGmail && productPassword ? `
            <div style="margin: 20px 0; padding: 20px; background-color: #0f172a; border: 1px solid #10b981; border-radius: 12px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #10b981; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">🔑 Your Product Login Credentials:</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 8px 0; color: #94a3b8;">Product Gmail:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: bold; font-family: monospace;">${productGmail}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8;">Password:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: bold; font-family: monospace;">${productPassword}</td>
                    </tr>
                </table>
            </div>
            ` : ''}

            <div style="background-color: #0f172a; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 10px 0; color: #94a3b8;">Item/Service:</td>
                        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${orderItems}</td>
                    </tr>
                    ${customerWhatsapp ? `
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 10px 0; color: #94a3b8;">WhatsApp:</td>
                        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${customerWhatsapp}</td>
                    </tr>
                    ` : ''}
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 10px 0; color: #94a3b8;">Price:</td>
                        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">PKR ${totalPrice}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #94a3b8;">Status:</td>
                        <td style="padding: 10px 0; color: ${isConfirmed ? '#10b981' : '#f59e0b'}; text-align: right; font-weight: bold; text-transform: uppercase;">${isConfirmed ? 'CONFIRMED' : 'PENDING'}</td>
                    </tr>
                </table>
            </div>

            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">${isConfirmed ? 'Please keep these details secure.' : ''} If you face any issues, feel free to reply to this email.</p>
            <p style="color: #cbd5e1; font-size: 14px; margin-top: 25px;">Best Regards,<br><strong style="color: #ffffff;">Jerry Automation Team</strong></p>
        </div>

        <div style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937;">
            <p style="margin: 0;">Support Email: <a href="mailto:contact@jerryautomation.com" style="color: #ef4444; text-decoration: none; font-weight: bold;">contact@jerryautomation.com</a></p>
        </div>
    </div>
</body>
</html>`;
};

export const getRefundEmailTemplate = ({
  customerName,
  itemName,
  totalPrice,
  status, // 'REFUNDED' | 'REJECTED' | 'UNDER REVIEW'
  rejectRemarks,
  refundMethod,
  accountNumber,
  accountTitle,
}: {
  customerName: string;
  itemName: string;
  totalPrice: string | number;
  status: string; 
  rejectRemarks?: string;
  refundMethod?: string;
  accountNumber?: string;
  accountTitle?: string;
}) => {
  const isRefunded = status.toUpperCase() === 'REFUNDED' || status.toUpperCase() === 'COMPLETED';
  const isUnderReview = status.toUpperCase() === 'UNDER REVIEW';

  const headingText = isRefunded ? 'Refund Successful' : isUnderReview ? 'Refund Request Received' : 'Refund Rejected';
  const bodyText = isRefunded
    ? 'Good news! Your refund request has been approved and the funds have been transferred.'
    : isUnderReview
    ? 'We have received your refund request. Our team will review it and get back to you within 24-48 hours.'
    : 'Your refund request has been reviewed by our team and could not be processed.';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; margin: 0; padding: 0; color: #cbd5e1;">
    <div style="max-width: 600px; margin: 30px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        
        <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #ef4444;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px;">
                JERRY <span style="color: #ef4444;">AUTOMATION</span>
            </h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase;">Premium Tools & Courses</p>
        </div>

        <div style="padding: 30px;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 22px; font-weight: 700;">${headingText}</h2>
            <p style="color: #cbd5e1; line-height: 1.6; font-size: 15px;">
                Dear <strong>${customerName}</strong>,<br>
                ${bodyText}
            </p>

            ${!isRefunded && !isUnderReview && rejectRemarks ? `
            <div style="margin: 20px 0; padding: 20px; background-color: #450a0a; border: 1px dashed #ef4444; border-radius: 12px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #ef4444; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Admin Remarks:</p>
                <p style="margin: 0; font-size: 15px; color: #fecaca;">${rejectRemarks}</p>
            </div>
            ` : ''}

            <div style="background-color: #0f172a; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 10px 0; color: #94a3b8;">Item/Service:</td>
                        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${itemName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 10px 0; color: #94a3b8;">Amount:</td>
                        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">PKR ${totalPrice}</td>
                    </tr>
                    ${refundMethod ? `
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 10px 0; color: #94a3b8;">Refund Method:</td>
                        <td style="padding: 10px 0; color: #60a5fa; text-align: right; font-weight: bold;">${refundMethod}</td>
                    </tr>
                    ` : ''}
                    ${accountNumber ? `
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 10px 0; color: #94a3b8;">Account Number:</td>
                        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${accountNumber}</td>
                    </tr>
                    ` : ''}
                    ${accountTitle ? `
                    <tr style="border-bottom: 1px solid #1f2937;">
                        <td style="padding: 10px 0; color: #94a3b8;">Account Name:</td>
                        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${accountTitle}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 10px 0; color: #94a3b8;">Status:</td>
                        <td style="padding: 10px 0; color: ${isRefunded ? '#10b981' : isUnderReview ? '#f59e0b' : '#ef4444'}; text-align: right; font-weight: bold; font-size: 15px; text-transform: uppercase;">${isRefunded ? 'REFUNDED' : status}</td>
                    </tr>
                </table>
            </div>

            <p style="color: #cbd5e1; font-size: 14px; margin-top: 20px;">Best Regards,<br><strong style="color: #ffffff;">Jerry Automation Team</strong></p>
        </div>

        <div style="background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937;">
            <p style="margin: 0;">Support Email: <a href="mailto:contact@jerryautomation.com" style="color: #ef4444; text-decoration: none; font-weight: bold;">contact@jerryautomation.com</a></p>
        </div>
    </div>
</body>
</html>`;
};
