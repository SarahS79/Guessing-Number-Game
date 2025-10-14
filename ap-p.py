from flask import Flask, render_template, request, jsonify, session
from random import randint
from datetime import timedelta

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "replace-with-a-secure-random-string"  # change this before deploying
app.permanent_session_lifetime = timedelta(days=7)

def ensure_game():
    session.permanent = True
    if "secret" not in session:
        session["secret"] = randint(1, 100)
        session["attempts"] = 0
        session["won"] = False

@app.route("/")
def index():
    ensure_game()
    return render_template("index.html")

@app.route("/guess", methods=["POST"])
def guess():
    ensure_game()
    data = request.get_json() or {}
    try:
        guess = int(data.get("guess", None))
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Please submit a valid integer."}), 400

    if session.get("won"):
        return jsonify({"status": "ok", "result": "already_won", "message": "You already guessed the number!"})

    session["attempts"] = session.get("attempts", 0) + 1
    secret = session.get("secret")
    if guess == secret:
        session["won"] = True
        return jsonify({
            "status": "ok",
            "result": "correct",
            "message": f"Correct! The number was {secret}.",
            "attempts": session["attempts"]
        })
    elif guess < secret:
        return jsonify({"status": "ok", "result": "low", "message": "Too low!", "attempts": session["attempts"]})
    else:
        return jsonify({"status": "ok", "result": "high", "message": "Too high!", "attempts": session["attempts"]})

@app.route("/restart", methods=["POST"])
def restart():
    # reset the game for this session
    session["secret"] = randint(1, 100)
    session["attempts"] = 0
    session["won"] = False
    return jsonify({"status": "ok", "message": "Game restarted."})

if __name__ == "__main__":
    app.run(debug=True)
