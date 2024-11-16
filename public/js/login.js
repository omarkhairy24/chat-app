document.getElementById('login').addEventListener('submit',async function(event){
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const formData ={
    email:email,
    password:password
  };

  try{
    const response = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
    });

    if(response.ok){
      console.log('login successful');
      window.location.href = '/views/home'
    }
    else{
      const errorData = await response.json();
      console.error('login failed', errorData);
    }
  }catch(error){
    console.error('Error:', error);
  }
})
