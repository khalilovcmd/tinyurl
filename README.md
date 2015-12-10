### **summary**

- create a tiny url
	- get url (as input from body)
	- make md5 hash of url
	- one cache layer (redis), and storage layer (mongo)
	- fast retrieval of the tiny url from **redis** (if it exists)
	- fast retrieval of the tiny url from **mongo** (if it doesn't exist in redis) - mongo has an single key index on tiny url **code**
	- if it doesn't exist in both **redis and mongo**, that means we need to create a new **tiny url**
	- create tiny url
	- persist in redis (for 24 hours only)
	- persist in mongo
	- return tiny url

- get an original url from tiny url
	- get tiny url (as input from query)
	- check if it exists in redis
	- check if it exists in mongo (if it does, place it in redis)
	- return tiny url OR error

### **improvements**

- check for url hash collision
- better input validation
- better error management and handling
- more descriptive restful based error responses

### **apis**

#### **create a tiny url**

**URL** /experiment/api/v1/shortner/  
**Method:** `POST` 
**Body**  
`{ url: "www.nerd-in-dubai.com" }`   
**Success Response:**  
 - **Code:** 201
 - **Content:** `{ code: "ejhhfi4qg" }`

#### **get tiny url**

**URL** /experiment/api/v1/shortner/:code  
**Method:** `GET`  
**Body**  
**Success Response:**  
 - **Code:** 200	
 - **Content:** 
`{ url : "www.nerd-in-dubai.com" }`

### **usage**

- npm install
- for running gulp: gulp default
- for running mocha only: mocha
- for running heroku: heroku open

### **deployment**

- the project is deployed on heroku (using redis + mongo addons)
