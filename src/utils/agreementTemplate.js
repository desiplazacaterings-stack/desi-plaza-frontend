export default function generateAgreement(form) {
  return `
CATERING SERVICE AGREEMENT

This agreement is entered into on ${new Date().toLocaleDateString()} between:

1. PARTIES
Service Provider: Desi Plaza Caterings
Client: ${form.customerName}
Contact Number: ${form.mobile}
Email: ${form.email}

2. EVENT DETAILS
Event Type: ${form.eventType}
Event Date: ${form.eventDate}
Event Time: ${form.eventTime}
Number of Guests: ${form.guests}
Location: ${form.location}

3. SERVICES PROVIDED
Desi Plaza Caterings will provide catering services including food preparation and delivery as discussed. The final menu and quantity of food will be confirmed by both parties before the event date. Pricing will be provided separately based on the menu selection and number of guests.

4. SPECIAL REQUESTS & NOTES
${form.notes || 'No special requests noted'}

5. PRICING & PAYMENT
- A deposit of 25% of the total estimated cost is required to confirm the booking
- The remaining balance is due 7 days before the event date
- Payment can be made via cash, check, or electronic transfer
- Prices are subject to change based on final menu confirmation and guest count

6. CANCELLATION POLICY
- Cancellations made more than 30 days before the event: Full refund of deposit
- Cancellations made 15-30 days before the event: 50% of deposit retained
- Cancellations made less than 15 days before the event: No refund of deposit
- Desi Plaza Caterings reserves the right to cancel with 14 days notice and full refund

7. CLIENT RESPONSIBILITIES
- Provide accurate guest count at least 7 days before the event
- Ensure venue is accessible and has adequate space for food setup
- Arrange tables, chairs, and serving equipment if not provided by caterer
- Notify Desi Plaza Caterings of any dietary restrictions at the time of booking
- Provide parking access for catering vehicle if applicable

8. FOOD SAFETY
Desi Plaza Caterings maintains proper food handling and sanitation practices. We follow industry standards for food storage, preparation, and serving. The client is responsible for informing us of any known allergies or dietary restrictions.

9. LIMITATION OF LIABILITY
Desi Plaza Caterings is not responsible for injuries, lost items, or property damage during the event. The client assumes all risk and agrees to hold Desi Plaza Caterings harmless from any claims arising from the event.

10. AGREEMENT ACCEPTANCE
By signing below, both parties agree to all terms outlined in this agreement. Any changes must be requested in writing and agreed upon by both parties.

11. SIGNATURES

CLIENT:
Name (Printed): ${form.customerName}
Signature: ________________________  Date: __________

DESI PLAZA CATERINGS:
Authorized Representative: ________________________
Signature: ________________________  Date: __________


For inquiries, contact:
Desi Plaza Caterings
Phone: ${form.mobile}
Email: ${form.email}
`;
}
