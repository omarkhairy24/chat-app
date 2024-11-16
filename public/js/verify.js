document.getElementById('otp').addEventListener('submit',async function(event){
    event.preventDefault();

    const email = localStorage.getItem('email');
    const otp = document.getElementById('otp-input').value;
    const formData = {
        email:email,
        otp: otp
    };

    try {
        const response = await fetch('/user/signup/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log('Signup successful');
            localStorage.removeItem('email', email);
            window.location.href = '/views/login';
        } else {
            const errorData = await response.json();
            console.error('Signup failed', errorData);
        }
    } catch (error) {
        console.error('Error:', error);
    }
})
