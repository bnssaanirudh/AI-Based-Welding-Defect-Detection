import streamlit as st
import streamlit_authenticator as stauth

def login():

    credentials = {
        "usernames": {
            "admin": {
                "name": "Admin",
                "password": "1234"
            }
        }
    }

    authenticator = stauth.Authenticate(
        credentials,
        cookie_name="welding_ai_cookie",
        key="random_signature_key",
        cookie_expiry_days=1
    )

    authenticator.login(location="main")

    if st.session_state.get("authentication_status"):
        return True
    else:
        return False
