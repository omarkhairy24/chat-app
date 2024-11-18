document.getElementById('signup').addEventListener('submit',async function(event){
    event.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if(password !== confirmPassword) {
      console.error('password and confirm password must match');
      return;
    }

    const formData = {
        email: email,
        username: username,
        name: name,
        password: password
    };

    try {
        const response = await fetch('/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log('Signup successful');
            localStorage.setItem('email', email);
            window.location.href = '/views/verify';
        } else {
            const errorData = await response.json();
            alert('error:'+errorData.message);
            console.error('Signup failed', errorData);
        }
    } catch (error) {
        console.error('Error:', error);
    }
})
