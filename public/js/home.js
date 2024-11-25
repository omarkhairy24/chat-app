const socket = io('http://localhost:3000');
// const socket = io('https://adaptive-behavior.onrender.com');



socket.on('connect', () => {
  console.log(`Connected to server: ${socket.id}`);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});



socket.off('receiveMessage');

function showNotification(message) {
  
  const notification = document.getElementById('notification-alert');
  const messageElement = document.getElementById('notification-message');
  const notificationSound = document.getElementById('notification-sound');
  
  notificationSound.play();

  messageElement.textContent = message;

  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 5000);
}

function closeNotification() {
  document.getElementById('notification-alert').classList.remove('show');
}


socket.on('notification', (data) => {
  showNotification(data.message);
});


function sendMessage(receiverId, content, images) {
  const formData = new FormData();
  formData.append('reciever_id', receiverId);
  formData.append('content', content);

  Array.from(images).forEach((image, index) => {
    formData.append('image', image);
  });

  return fetch(`/chat/send_message`, {
      method: 'POST',
      credentials: 'include',
      body: formData
  })
  .then(response => {
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
  })
  .catch(error => {
      console.error(error);
  });
}

function validateFileCount(input) {
  const maxFiles = 5;

  if (input.files.length > maxFiles) {
    alert(`You can only select a maximum of ${maxFiles} images.`);
    input.value = '';
    document.getElementById('file-names').textContent = 'No files selected';
  } else {
    const fileNames = Array.from(input.files).map(file => file.name).join(', ');
    document.getElementById('file-names').textContent = fileNames || 'No files selected';
  }
}

function chat(user_id){
  return fetch(`/chat/get-chat/${user_id}`,{
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response=>{
    if(!response.ok) throw new Error('somthing went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error);
  })
}

function loadChat(id) {
  chat(id).then(data=>{
    if(!data) return;
    
    const userInfo = data[0];
    const messages = data[1];
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Discord Chat Interface</title>
          <link rel="stylesheet" href="/css/chat.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
      </head>
      <body>
          <div class="discord-container">
              <div class="profile-sidebar">
                  <div class="user-profile">
                      <img src="/users/${userInfo.image || 'user.png'}" alt="User Profile">
                      <h4>${userInfo.username}</h4>
                  </div>
              </div>
              <div class="chat-window">
                  <div class="header">
                      <h2>${userInfo.name}</h2>
                  </div>
                  <div class="chat-log" id="chat-log">
                                ${messages.map(message => `
                                    <div class="chat-message">
                                        <div class="message-header">
                                            <img src="/users/${message.user_image || 'user.png'}" alt="User Image" class="user-avatar">
                                            <span class="username">${message.username}</span>
                                            <span class="timestamp">${message.created_at.split('-').join('/')}</span>
                                        </div>
                                        <span class="message">${message.message || ''}</span>
                                        ${message.message_image && message.message_image.length > 0 && message.message_image[0] !== null ? `
                                          <div class="message-images">
                                            ${message.message_image.map(img => `<img src="/messages/${img}" class="message-image">`).join('')}
                                          </div>
                                        ` : ''}
                                        <hr>
                                    </div>
                                `).join('')}
                    </div>
                  <div class="message-input">
                      <input type="file" id="file-upload" class="file-input" multiple hidden onchange="validateFileCount(this)">
                      <label for="file-upload" class="file-label">📎</label>
                      <span id="file-names" class="file-names"></span>
                      <input type="text" placeholder="Type a message..." class="input-field" id="message-content">
                      <button class="send-button">Send</button>
                  </div>
              </div>
              <div class="profile-sidebar">
                  <p>Member Since ${userInfo.created_at}</p>
                  <p>1 Mutual Server</p>
              </div>
          </div>
      </body>
      </html>
    `;
    const chatLog = document.getElementById('chat-log');
    setTimeout(() => {
      chatLog.scrollTop = chatLog.scrollHeight;
    }, 0);
    const sendButton = document.querySelector('.send-button');
    const messageInput = document.getElementById('message-content');
    const fileInput = document.getElementById('file-upload');
    const fileNames = document.getElementById('file-names');

    fileInput.addEventListener('change', () => {
      const files = Array.from(fileInput.files).map(file => file.name).join(', ');
      fileNames.textContent = files || 'No files selected';
    });


    socket.on('receiveMessage', (message) => {
      socket.off('notification')
      chatLog.innerHTML += `
        <div class="chat-message">
          <div class="message-header">
            <img src="/users/${message.user_image || 'user.png'}" alt="User Image" class="user-avatar">
            <span class="username">${message.username}</span>
            <span class="timestamp">${message.created_at.split('-').join('/')}</span>
          </div>
          <span class="message">${message.message}</span>
          ${message.image && message.image.length > 0 ? `
            <div class="message-images">
              ${message.image.map(img => `<img src="/messages/${img}" alt="Message Image" class="message-image">`).join('')}
            </div>
          ` : ''}
          <hr>
        </div>
      `;
      chatLog.scrollTop = chatLog.scrollHeight;
    });

    sendButton.addEventListener('click', () => {
      const content = messageInput.value.trim();
      const images = fileInput.files
      const receiver_Id = userInfo.user_id;
      let group_id;

      if (!content && images.length === 0) return;

      sendMessage(receiver_Id, content, images).then(response => {
        if (response) {
          
          socket.emit('sendMessage', response[0]);
          socket.emit('notifications',receiver_Id,response[0].username);
          messageInput.value = '';
          fileInput.value = ''; 
          fileNames.textContent = '';
          chatLog.scrollTop = chatLog.scrollHeight;
        }
      });
    });
  })
};

document.addEventListener("DOMContentLoaded", () => {
    fetchChats();
    getGroups();
});

function fetchChats() {
    fetch('/chat/get-chats', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        displayChats(data);
      })
      .catch(error => console.error('Error fetching chat data:', error));
}

function displayChats(chats) {
    const dmList = document.getElementById('dm-list');
    dmList.innerHTML = '';
  
    chats.forEach(chat => {
      const chatButton = document.createElement('button');
      chatButton.classList.add('dm-user');
      chatButton.onclick = () => loadChat(chat.user_id);
  
      chatButton.innerHTML = `
        <li>
          <img src="/users/${chat.user_image || 'user.png'}" alt="avatar" />
          <p class="latest-message">${chat.name}</p>
        </li>
      `;
  
      dmList.appendChild(chatButton);
    });
}

document.getElementById('add-friend-btn').addEventListener('click', showAddFriendPage);

function showAddFriendPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
  <div class="center-container">
    <div class="search-container">
      <h1>ADD FRIEND</h1>
      <p>You can add friends with their Discord username.</p>
      <div class="input-search-container">
        <input type="text" id="search-username" placeholder="Enter Discord username..." />
        <button id="search-btn">Search</button>
      </div>
      <div class="user-list" id="user-list" style="display: none;"></div>
    </div>
  </div>
  `;
  document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-username').value;
    if(query.length === 0) return;
    showUserList(query);
  });
}


function getSearch(query){
  return fetch(`/user/search`,{
    method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          query:query
      })
  }).then(response=>{
    if(!response.ok) throw new Error('somthing went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error);
  })
}

function showUserList(query) {
  getSearch(query).then(data => {
    if (!data) return;

    const userListContainer = document.getElementById('user-list');
    userListContainer.innerHTML = ''; // Clear the container

    data.forEach(user => {
      // Create elements for user item
      const userItem = document.createElement('div');
      userItem.classList.add('user');

      userItem.innerHTML = `
        <img src="/users/${user.image || 'user.png'}" alt="${user.image}" class="avatar">
        <div class="user-info">
          <span class="username">${user.name}</span>
          <span class="display-name">${user.username}</span>
        </div>
      `;

      
      const actions = document.createElement('div');
      actions.classList.add('actions');
      const acceptButton = document.createElement('button');
      acceptButton.classList.add('accept-btn');
      acceptButton.textContent = 'Add Friend';

      acceptButton.addEventListener('click', () => {
        acceptButton.textContent = 'Request Sent'; 
        acceptButton.disabled = true;
        acceptButton.classList.add('sent');
        sendRequest(user.id);
      });

      actions.appendChild(acceptButton);
      userItem.appendChild(actions);

      userListContainer.appendChild(userItem);
    });

    userListContainer.style.display = 'block';
  });
}

function sendRequest(receiverId) {
  return fetch('/pending/add-contact', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reciever: receiverId })
  })
  .then(response => {
    if (!response.ok) throw new Error('Something went wrong');
    return response.json();
  })
  .catch(error => {
    console.error(error);
  });
}

function getPendings(){
  return fetch('/pending/pendings',{
    method:'GET',
    credentials:'include',
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(response=>{
    if(!response.ok) throw new Error('something went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error)
  })
}

function accept(sender){
  return fetch('/pending/accept',{
    method:'POST',
    credentials:'include',
    headers:{
      'Content-Type': 'application/json'
    },
    body:JSON.stringify({sender:sender})
  }).then(response=>{
    if(!response.ok) throw new Error('something went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error)
  })
}

function reject(sender){
  return fetch('/pending/remove',{
    method:'DELETE',
    credentials:'include',
    headers:{
      'Content-Type': 'application/json'
    },
    body:JSON.stringify({sender:sender})
  }).then(response=>{
    if(!response.ok) throw new Error('something went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error)
  })
}

function showPendings() {
  getPendings().then(data => {
    if (!data) return;

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="user-list"></div>';

    const userList = mainContent.querySelector('.user-list');

    data.forEach(user => {
      const userItem = document.createElement('div');
      userItem.classList.add('user');

      userItem.innerHTML = `
        <img src="/users/${user.image || 'user.png'}" alt="User avatar" class="avatar">
        <div class="user-info">
          <span class="username">${user.name}</span>
          <span class="display-name">${user.username}</span>
        </div>
        <div class="actions">
          <button class="accept-btn" id="accept-request">✔</button>
          <button class="reject-btn" id="reject-request">✖</button>
        </div>
      `;

      userItem.querySelector('.accept-btn').addEventListener('click', () => {
        accept(user.id); 
        userItem.remove();
      });

      userItem.querySelector('.reject-btn').addEventListener('click', () => {
        reject(user.id);
        userItem.remove();
      });

      userList.appendChild(userItem);
    });
  }).catch(error => {
    console.error("Failed to load pendings:", error);
  });
}

document.getElementById('Pending').addEventListener('click', showPendings);

function getContacts(){
  return fetch('/chat/get-contacts',{
    method:'GET',
    credentials:'include',
    headers:{
      'Content-Type':'application/json'
    }
  }).then(response=>{
    if(!response.ok) throw new Error('somthing went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error)
  })
}

document.getElementById('contacts').addEventListener('click',()=>{
  getContacts().then(data => {
    if (!data) return;
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<div class="user-list"></div>';

    const userList = mainContent.querySelector('.user-list');

    data.forEach(user => {
      const userItem = document.createElement('div');
      userItem.classList.add('user');

      userItem.innerHTML = `
        <img src="/users/${user.user_image || 'user.png'}" alt="User avatar" class="avatar">
        <div class="user-info">
          <span class="username">${user.name}</span>
          <span class="display-name">${user.username}</span>
        </div>
        <div class="actions">
          <button class="accept-btn" id="accept-request">message</button>
        </div>
      `;

      userItem.querySelector('.accept-btn').addEventListener('click', () => {
        loadChat(user.user_id);
      });

      userList.appendChild(userItem);
    });
  }).catch(error => {
    console.error("Failed to load pendings:", error);
  });
})

document.getElementById('online').addEventListener('click', () => {
  location.reload()
});

function getOnline() {
  getContacts().then(data => {
    if (!data) return;
    socket.emit('onlineFriends');

    socket.on('onlineContacts', (users) => {
      const mainContent = document.getElementById('main-content');
      if (users.length === 0) {
        return;
      }
      mainContent.innerHTML = `
        <div class="header" id="active-now">
          <h2>Active Now</h2>
          <hr style="width:100%; margin-bottom: 100px; margin-left: 0.5em; border: 1px solid black;">
        </div>
        <div class="user-list"></div>
      `;
      const userList = mainContent.querySelector('.user-list');
      userList.innerHTML = '';

      users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.classList.add('user');

        userItem.innerHTML = `
          <img src="/users/${user.user_image || 'user.png'}" alt="User avatar" class="avatar">
          <div class="user-info">
            <span class="username">${user.name}</span>
            <span class="display-name">${user.username}</span>
          </div>
          <div class="actions">
            <button class="accept-btn">Message</button>
          </div>
        `;

        // Add event listener for each user to open chat
        userItem.querySelector('.accept-btn').addEventListener('click', () => {
          loadChat(user.user_id);
        });

        userList.appendChild(userItem);
      });
    });
  }).catch(error => {
    console.error("Failed to load contacts:", error);
  });
}

// Ensure `getOnline` runs when the DOM is fully loaded
window.onload = getOnline;



function getMe(){
  return fetch('/user/me',{
    method:'GET',
    credentials:'include',
    headers:{
      'Content-Type':'application/json'
    }
  }).then(response=>{
    if(!response.ok) throw new Error('something went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error)
  })
}

function updatePassword(oldPassword,newPassword){
  return fetch('/user/update-password',{
    method:'PATCH',
    credentials:'include',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({oldPassword:oldPassword ,newPassword:newPassword})
  }).then(response=>{
    if(!response.ok) {
      alert('something went wrong')
      throw new Error('something went wrong');
    }
    alert('password updated successfully');
    return response.json()
  }).catch(error=>{
    console.error(error)
  })
}

document.getElementById('my-profile').addEventListener('click',()=>{
  getMe().then(user=>{
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
    <div class="profile-container">
      <div class="profile-title">Personal Info</div>
      
      <div class="user-profile-section">
        <img src="/users/${user.image || '/user.png'}" alt="Profile Picture">
        <div class="file-upload">
            <label for="fileUpload">Choose File</label>
            <input type="file" id="fileUpload">
            <span class="file-name" id="fileName">No file chosen</span>
        </div>
      </div>
      
      <div class="form-profile-group">
        <label for="name">name</label>
        <input type="text" id="name" value="${user.name}">
      </div>
  
      <div class="form-profile-group">
        <label for="username">UserName</label>
        <input type="email" id="username" value="${user.username}" disabled>
      </div>
      
      <div class="form-profile-group">
        <label for="email">email</label>
        <input type="email" id="email" value="${user.email}" disabled>
      </div>
      <button id="submitProfileUpdate" type="button">Update info</button>
      
  
      <div class="title">update Password</div>
      <div class="form-profile-group">
        <label for="oldPassword">old password</label>
        <input type="password" id="oldPass" >
      </div>
  
      <div class="form-profile-group">
        <label for="newPassword">new password</label>
        <input type="password" id="newPass">
      </div>
  
      <div class="form-profile-group">
        <label for="confirmPassword">confirm password</label>
        <input type="password" id="ConfirmPass">
      </div>
      <button id="submitPasswordUpdate" type="button">Update password</button>
    </div>
  `;

    document.getElementById('fileUpload').addEventListener('change', function(event) {
      const fileNameSpan = document.getElementById('fileName');
      const file = event.target.files[0];
    
      if (file) {
        fileNameSpan.textContent = file.name;
      } else {
        fileNameSpan.textContent = 'No file chosen';
      }
    });

    document.getElementById('submitProfileUpdate').addEventListener('click', submitProfileUpdate);
    document.getElementById('submitPasswordUpdate').addEventListener('click',()=>{
      const oldPassword = document.getElementById('oldPass').value;
      const newPassword = document.getElementById('newPass').value;
      const confirmPassword = document.getElementById('ConfirmPass').value;
      if(newPassword !== confirmPassword){
        alert('password and confirm password must match');
        return;
      }
      updatePassword(oldPassword,newPassword)

    })
  })
})

async function submitProfileUpdate() {
  const name = document.getElementById('name').value;
  const fileInput = document.getElementById('fileUpload').files[0];

  const formData = new FormData();
  formData.append('name', name);
  
  if (fileInput) {
    formData.append('image', fileInput);
  }

  try {
    const response = await fetch('/user/update-info', {
      method: 'PATCH',
      credentials:'include',
      body: formData,
    });

    if (response.ok) {
      const updatedUser = await response.json();
      alert('Profile updated successfully!');
    } else {
      const errorData = await response.json();
      alert(`Failed to update profile: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('An error occurred while updating the profile.');
  }
}

function getGroups(){
  return fetch('/groups/get-groups',{
    method:'GET',
    credentials:'include',
    headers:{
      'Content-Type':'application/json'
    }
  }).then(response=>{
    if(!response.ok) throw new Error('something went wrong');
    return response.json()
  }).then(data=>{
    displayGroups(data);
  })
  .catch(error=>{
    console.error(error)
  })
}


function getGroupMember(group_id){
  return fetch(`/groups/get-group-member/${group_id}`,{
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response=>{
    if(!response.ok) throw new Error('somthing went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error);
  })
}

function group_chat(group_id){
  return fetch(`/groups/get-group-chat/${group_id}`,{
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response=>{
    if(!response.ok) throw new Error('somthing went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error);
  })
}

function displayGroups(groups){
  const lsideBar = document.getElementById('left-sidebar');
  groups.forEach(group=>{
    const divCircle = document.createElement('div')
    divCircle.classList.add('icon-circle')
    divCircle.innerHTML = `
    <img class="icon-circle" src="/group/${group.cover}" alt="avatar">
    `
    divCircle.onclick = ()=> loadGroupChat(group.id);

    lsideBar.appendChild(divCircle);
  });
};


function sendGroupMessage(group_id, content, images) {
  const formData = new FormData();
  formData.append('group_id', group_id);
  formData.append('content', content);

  Array.from(images).forEach((image, index) => {
    formData.append('image', image);
  });

  return fetch(`/chat/send_message`, {
      method: 'POST',
      credentials: 'include',
      body: formData
  })
  .then(response => {
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
  })
  .catch(error => {
      console.error(error);
  });
}


function getMembersSearch(query,group_id){
  return fetch(`/groups/add-member-search`,{
    method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          query:query,
          group_id:group_id
      })
  }).then(response=>{
    if(!response.ok) throw new Error('somthing went wrong');
    return response.json()
  }).catch(error=>{
    console.error(error);
  })
}



function addMember(group_id,user_id){
  return fetch(`/groups/add-group-member/${group_id}`,{
    method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id:user_id
      })
  }).then(response=>{
    if(!response.ok) throw new Error('somthing went wrong',response);
    return response.json()
  }).catch(error=>{
    console.error(error);
  })
}


function showMembersList(query,group_id) {
  getMembersSearch(query,group_id).then(data => {
    if (!data) return;

    const userListContainer = document.getElementById('user-list');
    userListContainer.innerHTML = ''; // Clear the container

    data.forEach(user => {
      // Create elements for user item
      const userItem = document.createElement('div');
      userItem.classList.add('user');

      userItem.innerHTML = `
        <img src="/users/${user.image || 'user.png'}" alt="${user.image}" class="avatar">
        <div class="user-info">
          <span class="username">${user.name}</span>
          <span class="display-name">${user.username}</span>
        </div>
      `;

      
      const actions = document.createElement('div');
      actions.classList.add('actions');
      const acceptButton = document.createElement('button');
      acceptButton.classList.add('accept-btn');
      acceptButton.textContent = 'Add member';

      acceptButton.addEventListener('click', () => {
        acceptButton.textContent = 'added'; 
        acceptButton.disabled = true;
        acceptButton.classList.add('sent');
        addMember(group_id,user.id);
      });

      actions.appendChild(acceptButton);
      userItem.appendChild(actions);

      userListContainer.appendChild(userItem);
    });

    userListContainer.style.display = 'block';
  });
}

function showAddMember(group_id) {
  const sidebar = document.getElementById('profile-sidebar');
  sidebar.innerHTML = `
  <div class="center-container">
    <div class="search-container">
      <h1>ADD MEMBER</h1>
      <div class="input-search-container">
        <input type="text" id="search-username" placeholder="Enter Discord username..." />
        <button id="search-btn">Search</button>
      </div>
      <div class="user-list" id="user-list" style="display: none;"></div>
    </div>
  </div>
  `;
  document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-username').value;
    if(query.length === 0) return;
    showMembersList(query,group_id)
  });
}

function loadGroupChat(id) {
  group_chat(id).then(data=>{
    if(!data) return;
    
    const groupInfo = data[0][0];
    const messages = data[1];
    
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Discord Chat Interface</title>
          <link rel="stylesheet" href="/css/chat.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
      </head>
      <body>
          <div class="discord-container">
              <div class="profile-sidebar">
                  <div class="user-profile">
                      <img src="/group/${groupInfo.cover || 'user.png'}" alt="group Profile">
                      <h4>${groupInfo.name}</h4>
                  </div>
              </div>
              <div class="chat-window">
                  <div class="header">
                      <h2>${groupInfo.name}</h2>
                  </div>
                  <div class="chat-log" id="chat-log">
                                ${messages.map(message => `
                                    <div class="chat-message">
                                        <div class="message-header">
                                            <img src="/users/${message.user_image || 'user.png'}" alt="User Image" class="user-avatar">
                                            <span class="username">${message.username}</span>
                                            <span class="timestamp">${message.created_at.split('-').join('/')}</span>
                                        </div>
                                        <span class="message">${message.message || ''}</span>
                                        ${message.message_image && message.message_image.length > 0 && message.message_image[0] !== null ? `
                                          <div class="message-images">
                                            ${message.message_image.map(img => `<img src="/messages/${img}" class="message-image">`).join('')}
                                          </div>
                                        ` : ''}
                                        <hr>
                                    </div>
                                `).join('')}
                    </div>
                  <div class="message-input">
                      <input type="file" id="file-upload" class="file-input" multiple hidden onchange="validateFileCount(this)">
                      <label for="file-upload" class="file-label">📎</label>
                      <span id="file-names" class="file-names"></span>
                      <input type="text" placeholder="Type a message..." class="input-field" id="message-content">
                      <button class="send-button">Send</button>
                  </div>
              </div>
              <div class="profile-sidebar" id="profile-sidebar">
                  <!-- <p> Created At </p> -->
                      ${
                        getGroupMember(id).then(data => {
                          if (!data) return;
                          const admins = data[0];
                          const members = data[1];
                          
                          const sidebar = document.getElementById('profile-sidebar');
                          sidebar.innerHTML = `<div class="actions">
                          <button class="accept-btn" id="add-member">add member</button>
                          </div>
                          <div class="user-list"></div>`;
                          
                          
                          const userList = sidebar.querySelector('.user-list');
                          document.getElementById('add-member').addEventListener('click', ()=> showAddMember(id))


                          let count = 0;
                          admins.admin.forEach(admin=>{
                            count +=1
                            const userItem = document.createElement('div');
                            userItem.classList.add('user');
                            userItem.innerHTML = `
                                <img src="/users/${admin.admin_image || 'user.png'}" alt="User avatar" class="avatar">
                                <div class="user-info">
                                  <span class="username">${admin.admin_name}</span>
                                </div>
                                <div class="actions">
                                  <p>Admin</p>
                                </div>
                              `;

                          userList.appendChild(userItem);
                          })
                          
                          members.members.forEach(member=>{
                            count +=1
                            const userItem = document.createElement('div');
                            userItem.classList.add('user');
                            userItem.innerHTML = `
                                <img src="/users/${member.member_image || 'user.png'}" alt="User avatar" class="avatar">
                                <div class="user-info">
                                  <span class="username">${member.member_name}</span>
                                </div>
                                <div class="actions">
                                  <p>Member</p>
                                </div>
                              `;

                          userList.appendChild(userItem);
                          });
                          const p = document.createElement('p');
                          p.innerHTML =`<p>${count} Members </p>`;
                          sidebar.prepend(p)
                          
                        }).catch(error => {
                          console.error("Failed to load pendings:", error);
                        })
                      }
              </div>
          </div>
      </body>
      </html>
    `;

    
    const chatLog = document.getElementById('chat-log');
    setTimeout(() => {
      chatLog.scrollTop = chatLog.scrollHeight;
    }, 0);
    const sendButton = document.querySelector('.send-button');
    const messageInput = document.getElementById('message-content');
    const fileInput = document.getElementById('file-upload');
    const fileNames = document.getElementById('file-names');

    fileInput.addEventListener('change', () => {
      const files = Array.from(fileInput.files).map(file => file.name).join(', ');
      fileNames.textContent = files || 'No files selected';
    });


    socket.on('receiveMessage', (message) => {
      socket.off('notification')
      chatLog.innerHTML += `
        <div class="chat-message">
          <div class="message-header">
            <img src="/users/${message.user_image || 'user.png'}" alt="User Image" class="user-avatar">
            <span class="username">${message.username}</span>
            <span class="timestamp">${message.created_at.split('-').join('/')}</span>
          </div>
          <span class="message">${message.message}</span>
          ${message.image && message.image.length > 0 ? `
            <div class="message-images">
              ${message.image.map(img => `<img src="/messages/${img}" alt="Message Image" class="message-image">`).join('')}
            </div>
          ` : ''}
          <hr>
        </div>
      `;
      chatLog.scrollTop = chatLog.scrollHeight;
    });

    
    sendButton.addEventListener('click', () => {
      const content = messageInput.value.trim();
      const images = fileInput.files
      const group_id = id;

      if (!content && images.length === 0) return;

      sendGroupMessage(group_id, content, images).then(response => {
        if (response) {
          
          socket.emit('sendMessage', response[0]);
          getGroupMember(id).then(data=>{
            const admins = data[0];
            const members = data[1];

            admins.admin.forEach(admin=>{
              socket.emit('notifications',admin.id,`${groupInfo.name} - ${response[0].username}`);
            })

            members.members.forEach(member=>{
              socket.emit('notifications',member.id,`${groupInfo.name} - ${response[0].username}`);
            })
          })
          messageInput.value = '';
          fileInput.value = ''; 
          fileNames.textContent = '';
          chatLog.scrollTop = chatLog.scrollHeight;
        }
      });
    });
  })
};




document.getElementById('create-group-btn').addEventListener('click',()=>{

  const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
    <div class="profile-container">
      <div class="profile-title">Group Info</div>
      
      <div class="user-profile-section">
        <img src='/62731-friends-icon-button-computer-like-icons-download-free-image.png'}" alt="Profile Picture">
        <div class="file-upload">
            <label for="fileUpload">Choose File</label>
            <input type="file" id="fileUpload" required>
            <span class="file-name" id="fileName">No file chosen</span>
        </div>
      </div>
      
      <div class="form-profile-group">
        <label for="name">name</label>
        <input type="text" id="name" required>
      </div>

      <button id="create-group" type="button">create</button>

    </div>
  `;

    document.getElementById('fileUpload').addEventListener('change', function(event) {
      const fileNameSpan = document.getElementById('fileName');
      const file = event.target.files[0];
    
      if (file) {
        fileNameSpan.textContent = file.name;
      } else {
        fileNameSpan.textContent = 'No file chosen';
      }
    });

    document.getElementById('create-group').addEventListener('click',creategroup)
});


async function creategroup() {
  const name = document.getElementById('name').value;
  const fileInput = document.getElementById('fileUpload').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('cover', fileInput);
  
  if(!name || !fileInput) {
    alert('you should add name and cover');
    return;
  }

  try {
    const response = await fetch('/groups/create-group', {
      method: 'POST',
      credentials:'include',
      body: formData,
    });

    if (response.ok) {
      const group = await response.json();
      
      alert('group created successfully!');
    } else {
      const errorData = await response.json();
      alert(`Failed to create group: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error creating group:', error);
    alert('An error occurred while creating the group.');
  }
}