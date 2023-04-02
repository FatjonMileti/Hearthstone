"""Email templates. Behavior ports of server_node/src/utils/templates/*.ts.

Link contracts (must not change — the React client depends on them):
- verify email:  <FRONTEND_URL>/activate-account/<confirmation_token>
- reset/change:  <FRONTEND_URL>?resetPasswordToken=<token>
"""

from app.core.config import Settings


def verify_link(settings: Settings, confirmation_token: str) -> str:
    return f"{settings.frontend_url}/activate-account/{confirmation_token}"


def reset_password_link(settings: Settings, token: str) -> str:
    return f"{settings.frontend_url}?resetPasswordToken={token}"


def verify_email_html(confirmation_link: str) -> str:
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Email Confirmation</title></head>
<body style="background-color: #e9ecef;">
<h1>Confirm your account!</h1>
<p>We appreciate you. Thank you for joining the Hearthstone community, the best way
to buy, sell or rent a property using the power of technology and AI.
Good luck on your journey!</p>
<p><a href="{confirmation_link}">Confirm</a></p>
<p>If that doesn't work, copy and paste the following link in your browser:</p>
<p><a href="{confirmation_link}">{confirmation_link}</a></p>
<p>Cheers,<br> Hearthstone</p>
</body></html>"""


def reset_password_html(link: str, user_name: str) -> str:
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Reset Your Password</title></head><body>
<div style="max-width: 600px; margin: 0 auto;">
<h1>Reset Your Password</h1><p>Dear {user_name},</p>
<p>We received a request to reset your password for your Hearthstone account.
To proceed with the password reset process, please click on the link below:</p>
<p><a href="{link}" style="display: inline-block; padding: 10px 20px;
background-color: #007bff; color: #fff; text-decoration: none;">Reset Password</a></p>
<p>If you did not initiate this request, please ignore this email.</p>
<p>Please note that this link is valid for 24 hours.</p>
<p>Thank you,</p><p>The Hearthstone Team</p></div></body></html>"""


def general_template_html(
    link: str, asset_name: str, client_name: str, body_1: str = "", body_2: str = ""
) -> str:
    _ = link  # kept in signature for Node parity (generalTemplate takes link)
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Invitation</title></head><body>
<p>Hi {client_name},</p><p>{body_1}</p><p>{body_2}</p>
<p>Lost Fish has found a property that they think will be of interest to you: {asset_name}.
To view a property, you will need to register your email on our secure platform.</p>
<p>Cheers,<br> Hearthstone</p></body></html>"""


def send_application_html(link: str, asset_name: str, client_name: str) -> str:
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Invitation</title></head><body>
<p>Dear {client_name},</p>
<p>Thank you for completing your application for: {asset_name}</p>
<p>Please note, due to the high volume of applications, unfortunately not all applicants
will be invited to view the property. Please be assured all applications will be
considered carefully and we will be in contact regarding the next step as soon as possible.</p>
<p><a href="{link}">View Property</a></p>
<p>If that doesn't work, copy and paste the following link in your browser:</p>
<p><a href="{link}">{link}</a></p>
<p>Cheers,<br> Hearthstone</p></body></html>"""


def send_invitation_html(link: str, asset_name: str, client_name: str) -> str:
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Invitation</title></head><body>
<h1>You are invited by Lost Fish to checkout {asset_name}</h1>
<p>Hi {client_name},</p>
<p>Lost Fish has found a property that they think will be of interest to you: {asset_name}</p>
<p><a href="{link}">View Property</a></p>
<p>If that doesn't work, copy and paste the following link in your browser:</p>
<p><a href="{link}">{link}</a></p>
<p>Lost Fish has found a property that they think will be of interest to you: {asset_name}.
To view a property, you will need to register your email on our secure platform.
Once complete you will be able to: View all properties, Favourite a property,
Book a viewing online</p>
<p>Cheers,<br> Hearthstone</p></body></html>"""
