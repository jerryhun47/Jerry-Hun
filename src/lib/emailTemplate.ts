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

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #020617; color: #cbd5e1; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <!-- Header -->
      <div style="background-color: #dc2626; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Jerry Automation</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: 32px 24px;">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Order ${isConfirmed ? 'Confirmed' : 'Pending'}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Hi <strong>${customerName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
          ${isConfirmed 
            ? 'Your order has been confirmed! Here are your login credentials.' 
            : 'Your order is currently PENDING. We will review it and notify you once accepted.'}
        </p>
        
        <!-- Order Summary -->
        <div style="background-color: #0f172a; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #ffffff; margin-top: 0; font-size: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">Order Summary</h3>
          <p style="font-size: 15px; margin: 12px 0 4px 0; color: #94a3b8;"><strong>Customer:</strong> <span style="color: #cbd5e1;">${customerName}</span></p>
          ${customerWhatsapp ? `<p style="font-size: 15px; margin: 4px 0 4px 0; color: #94a3b8;"><strong>WhatsApp:</strong> <span style="color: #cbd5e1;">${customerWhatsapp}</span></p>` : ''}
          <p style="font-size: 15px; margin: 4px 0 4px 0; color: #94a3b8;"><strong>Item:</strong> <span style="color: #cbd5e1;">${orderItems}</span></p>
          <p style="font-size: 15px; margin: 4px 0 0 0; color: #94a3b8;"><strong>Price:</strong> <span style="color: #ef4444; font-weight: bold;">PKR ${totalPrice}</span></p>
        </div>

        <!-- Credentials Section -->
        ${isConfirmed && productGmail && productPassword ? `
          <div style="background-color: #1e1b4b; border: 1px dashed #6366f1; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #818cf8; margin-top: 0; font-size: 16px; border-bottom: 1px solid #312e81; padding-bottom: 12px;">Access Credentials</h3>
            <p style="font-size: 15px; margin: 12px 0 4px 0; color: #a5b4fc;"><strong>Mail:</strong> <span style="color: #ffffff;">${productGmail}</span></p>
            <p style="font-size: 15px; margin: 4px 0 0 0; color: #a5b4fc;"><strong>Password:</strong> <span style="color: #ffffff; font-family: monospace;">${productPassword}</span></p>
          </div>
        ` : ''}
        
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 24px;">
          If you have any questions or concerns, please feel free to contact our support team.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #0f172a; padding: 16px; text-align: center; border-top: 1px solid #1e293b;">
        <p style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Jerry Automation. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const getRefundEmailTemplate = ({
  customerName,
  itemName,
  totalPrice,
  status, // 'REFUNDED' | 'REJECTED' | 'UNDER REVIEW'
  rejectRemarks,
}: {
  customerName: string;
  itemName: string;
  totalPrice: string | number;
  status: string; 
  rejectRemarks?: string;
}) => {
  const isRefunded = status.toUpperCase() === 'REFUNDED';
  const isUnderReview = status.toUpperCase() === 'UNDER REVIEW';

  const headingText = isRefunded ? 'Successful' : isUnderReview ? 'Received' : 'Rejected';
  const bodyText = isRefunded
    ? 'Good news! Your refund request has been approved and the funds have been transferred.'
    : isUnderReview
    ? 'We have received your refund request. Our team will review it and get back to you within 24-48 hours.'
    : 'Your refund request has been reviewed by our team and could not be processed.';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #020617; color: #cbd5e1; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <!-- Header -->
      <div style="background-color: #dc2626; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Jerry Automation</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: 32px 24px;">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Refund ${headingText}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Hi <strong>${customerName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">${bodyText}</p>
        
        <!-- Refund Summary -->
        <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #ffffff; margin-top: 0; font-size: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">Request Details</h3>
          <p style="font-size: 15px; margin: 12px 0 4px 0; color: #94a3b8;"><strong>Item:</strong> <span style="color: #cbd5e1;">${itemName}</span></p>
          <p style="font-size: 15px; margin: 4px 0 0 0; color: #94a3b8;"><strong>Amount:</strong> <span style="color: #ef4444; font-weight: bold;">PKR ${totalPrice}</span></p>
        </div>

        ${!isRefunded && !isUnderReview && rejectRemarks ? `
          <div style="background-color: #450a0a; border: 1px dashed #ef4444; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #fca5a5; margin-top: 0; font-size: 16px; border-bottom: 1px solid #991b1b; padding-bottom: 12px;">Admin Remarks</h3>
            <p style="font-size: 15px; margin: 12px 0 4px 0; color: #fecaca;">${rejectRemarks}</p>
          </div>
        ` : ''}
        
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 24px;">
          If you have any questions or concerns, please feel free to contact our support team.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #0f172a; padding: 16px; text-align: center; border-top: 1px solid #1e293b;">
        <p style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Jerry Automation. All rights reserved.</p>
      </div>
    </div>
  `;
};
