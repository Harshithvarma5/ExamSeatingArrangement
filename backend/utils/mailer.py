import threading
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Personalization, Email
from config import Config

class BulkMailer:
    @staticmethod
    def send_hall_tickets(exam_name, student_data):
        """
        Sends hall tickets to multiple students in the background.
        student_data: list of dicts with {email, name, seat_number, room_number}
        """
        if not Config.SENDGRID_API_KEY:
            logging.warning("SendGrid API Key not set. E-mail sending skipped (Mock Mode).")
            return

        def _worker():
            try:
                sg = SendGridAPIClient(Config.SENDGRID_API_KEY)
                
                # SendGrid supports batch sending via Personalizations
                # We'll batch them in groups of 1000 (SendGrid limit per API call)
                batch_size = 1000
                for i in range(0, len(student_data), batch_size):
                    batch = student_data[i:i + batch_size]
                    
                    message = Mail(
                        from_email=Config.SENDGRID_FROM_EMAIL,
                        subject=f"Hall Ticket: {exam_name}",
                        plain_text_content="Your exam seating has been assigned."
                    )
                    
                    for student in batch:
                        p = Personalization()
                        p.add_to(Email(student['email']))
                        # You can add dynamic template data here if using SendGrid Templates
                        p.dynamic_template_data = {
                            "name": student['name'],
                            "exam": exam_name,
                            "room": student['room_number'],
                            "seat": student['seat_number']
                        }
                        message.add_personalization(p)
                    
                    # For this prototype, we'll use a simple text body if no template is provided
                    # In a real app, you'd use a SendGrid Template ID:
                    # message.template_id = "d-xxxxxxxxxxxxx"
                    
                    response = sg.send(message)
                    logging.info(f"Batch sent. Status Code: {response.status_code}")
                    
            except Exception as e:
                logging.error(f"Error sending bulk emails: {e}")

        # Run in background thread to avoid blocking the API response
        thread = threading.Thread(target=_worker)
        thread.start()
        return True
