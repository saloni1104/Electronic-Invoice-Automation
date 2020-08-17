## Frontend for uploading invoices to S3. 
The steps to run the given front end are:<br>
<strong> Step 1:</strong> Clone this given repository to your local pc<br>
<strong> Step 2:</strong> `npm install`<br>
<strong> Step 3:</strong> Configure `/config.json`<br>

{<br>
    "accessKeyId": "XXXXXXXXXXXXXXXXXXX",<br>
    "secretAccessKey": 	"XXXXXXXXXXXXXXXXXXXXXXXXX",<br>
    "region": "us-east-1"<br>
}<br>
Add in the credentials of the IAM user that you have set up which has full access to AMAZON s3 and AMAZON textract<br>
<strong> Step 4:</strong> Start the server<br> `node app.js`<br>
Now check http://localhost:3000<br>
