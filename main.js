async function postJson(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {})
    });
    return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
    const guessInput = document.getElementById('guessInput');
    const guessBtn = document.getElementById('guessBtn');
    const feedback = document.getElementById('feedback');
    const attemptsEl = document.getElementById('attempts');
    const restartBtn = document.getElementById('restartBtn');

    guessBtn.addEventListener('click', async() => {
        const val = guessInput.value;
        if (!val) {
            feedback.textContent = 'Please enter a number.';
            return;
        }
        const data = await postJson('/guess', { guess: Number(val) });
        handleResponse(data);
    });

    guessInput.addEventListener('keyup', async(e) => {
        if (e.key === 'Enter') guessBtn.click();
    });

    restartBtn.addEventListener('click', async() => {
        const data = await postJson('/restart');
        feedback.textContent = data.message || 'Restarted.';
        attemptsEl.textContent = 'Attempts: 0';
        guessInput.value = '';
    });

    function handleResponse(data) {
        if (!data) { feedback.textContent = 'Server error.'; return; }
        if (data.status === 'error') {
            feedback.textContent = data.message || 'Error.';
            return;
        }

        if (data.result === 'correct') {
            feedback.textContent = data.message + ` You took ${data.attempts} attempts.`;
            attemptsEl.textContent = `Attempts: ${data.attempts}`;
        } else if (data.result === 'low' || data.result === 'high') {
            feedback.textContent = data.message;
            attemptsEl.textContent = `Attempts: ${data.attempts || 0}`;
        } else if (data.result === 'already_won') {
            feedback.textContent = data.message;
        } else {
            feedback.textContent = data.message || 'OK';
        }
    }
});
