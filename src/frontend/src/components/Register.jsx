// src/components/Register.jsx
import React from 'react';
import { useState }  from 'react';

function Register({ text }) {

  const [userId, setUserId] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [setInputValue] = useState('');

  const handleRegister = (event) => {
    alert('Register Button clicked!');
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <form>
     <br />
     <label htmlFor="userId">UserId:</label>
     <input
        type="text"
        id="userId"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      /> 

     <br />
     <label htmlFor="password">Password:</label>
     <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
     
     <br />
     <label htmlFor="fullname">Full Name:</label>
     <input
        type="text"
        id="fullname"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
      />

     <br />
     <label htmlFor="email">eMail:</label>
     <input
        type="text"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
                      

     <br />
     <label htmlFor="phonenumber">Phone number:</label>
     <input
        type="text"
        id="phonenumber"
        value={phonenumber}
        onChange={(e) => setPhonenumber(e.target.value)}
      />                

     <br />
     <label htmlFor="address1">Address Line 1:</label>
     <input
        type="text"
        id="address1"
        value={address1}
        onChange={(e) => setAddress1(e.target.value)}
      />

     <br />
     <label htmlFor="address2">Address Line 2:</label>
     <input
        type="text"
        id="address2"
        value={address2}
        onChange={(e) => setAddress2(e.target.value)}
      />
                  
     <br />
     <label htmlFor="city">City:</label>
     <input
        type="text"
        id="city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
                        

     <br />
     <label htmlFor="state">Sate:</label>
     <input
        type="text"
        id="state"
        value={state}
        onChange={(e) => setState(e.target.value)}
      />
      
     <br />
     <label htmlFor="zipcode">Zip Code:</label>
     <input
        type="text"
        id="zipcode"
        value={zipcode}
        onChange={(e) => setZipcode(e.target.value)}
      />
     <br />
     <p>Current input: {userId}</p>

      <button onClick={handleRegister}>
        {text}
      </button>
    </form>
  );
}

export default Register;

