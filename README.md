# Flipkart-Grid-2.0-Invoice-Processor
## Solution overview
**Essentially we have created an API solution for FLIPKART which can be used in order to extract all the data from an invoice in a very efficient manner and it has been configured by using a DATABASE (DynamoDB) in order to maintain integrity of information and at the same time provide efficient and accurate results. The above solution is coupled along with a simple frontend and a python notebook which will obtain all the results and convert them into the required excel file which can then be provided to the customer. In this manner, essentially all the data which was present in the invoice is converted into an excel sheet. The solution is highly reliable because it makes use of AWS and it has been configured in a manner that it provides accurate and efficient result to the user. It provides the user with a frontend which is a major plus point as the user does not have to go through the hassle of opening the AWS console but can simply run a few CLI based commands.** It is straightforward to invoke this API from AWS CLI or using Boto3 Python library and pass either a pointer to the document image stored in S3 or the raw image bytes to obtain results.
In this Invoice processor solution, following approaches are used to provide for a more robust end to end solution.<br>
- Lambda functions triggered by document upload to specific S3 bucket to submit document analysis and text detection jobs to Textract
- API Gateway methods to trigger Textract job submission on-demand
- Asynchronous API calls to start Document analysis and Text detection, with unique request token to prevent duplicate submissions
- Use of SNS topics to get notified on completion of Textract jobs
- Automatically triggered post processing Lambda functions to extract actual tables, forms and lines of text, stored in S3 for future querying
- Job status and metadata tracked in DynamoDB table, allowing for troubleshooting and easy querying of results
- API Gateway methods to retrieve results anytime without having to use Textract
  
Follow the below given steps in order to understand how to install the entire infrastrcture of this solution of invoice processing.<br>
If you are <strong>`testing`</strong> the given project, then head over to <strong>`SECTION B`</strong> but if you are looking at<br>
**`installing the given project`**, head over to **`SECTION A`**.<br>
## SECTION A - Installing the project individually (on a seperate machine and a seperate AWS account)<br>
**Step 1: Creating an AWS account would be the first and most important step of this step.**<br>
One of the important things to note as a newly signed user is about the <a href="https://aws.amazon.com/free">free tier</a> which you get when you sign up as a new user with AWS. You can read about it in the hyperlink mentioned above. Click <a href="https://aws.amazon.com/aispl/registration-confirmation">here</a> in order to register as a new AWS user. You can read about the free tier on the AWS page or using the link provided above.<br>

**Step 2: Open your AWS management console and search for the service called `Cloud Formation`.**<br> 
Click on `Create new Stack` and select the option which says, use a predefined template. Now I have already defined the template which is available in this repository in `AWS STACK template` and is present as a JSON file. Copy the entire JSON file or attach it to Cloud Formation and wait for Cloud Formation to create the entire stack of resources that would be needed for the project.<br>
Make sure to copy the entire JSON file and add the name of your required buckets or roles which are being defined which can be edited in the JSON.<br> 
###### Note: I have created the entire template based on the architecture that I had planned. You can adjust the JSON according to your requirement. The JSON is a very easy representation the architecture planned by me. It creates the roles required along with the database and the S3 bucket which would be needed. 
**Step 3: Cross check if all the resources have been successfully deployed by refreshing the Cloud Formation page and looking for the `Stack Created` option.**<br>
This is an important step and if any error occurs during this stage, an immediate rollback shall occur which would mean that the resources that have been created are being destroyed. At this stage, you would have to check your IAM policies and make sure that the user has sufficient access. You can click <a href="https://aws.amazon.com/iam/">here</a> to understand more about the IAM policies.<br>
**Step 4: You need to modify your CORS configuration in your S3 bucket. So head over to the S3 console and add the following configuration to your CORS config.**<br>
You need to head on to the s3 bucket and in "Permissions", click on CORS configuration and copy paste the below given config:<br>
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```
**Step 5: Testing the API gateway**<br>
You can test the API by heading over to the AWS API Gateway and by clicking on the API created using the url and making use of any of the below given links:<br>
- Textract Job start by API Invocation: If you already have documents present in bucket, or not the owner of the bucket, you can still trigger the same workflow as above, by sending a request to Rest API method as follows: https://deployment-id.execute-api.us-east-1.amazonaws.com/demo/submittextanalysisjob?Bucket=your-bucket-name&Document=your-document-key You can find the deployment-id of the API from the stack output.<br>
 - Textract result retrieval via Rest API: If the initial submission goes well, and does not exceed provisioned throughput for maximum number of trials, result will be ready and post-processed within few seconds to minutes. At that point, the document analysis result can be retrieved by invoking Rest API method as follows: https://deployment-id.execute-api.us-east-1.amazonaws.com/demo/retrievedocumentanalysisresult?Bucket=your-bucket-name&Document=your-document-key&ResultType=ALL|TABLE|FORM. Similarly text detection result can be obtained by invoking Rest API method as follows: https://deployment-id.execute-api.us-east-1.amazonaws.com/demo/retrievetextdetectionresult?Bucket=your-bucket-name&Document=your-document-key You can find the deployment-id of the API from the stack output. In both cases, the API response will contain a list of files on S3 bucket where the results are stored for future use. You can also download and open the result files, either to inspect the contents manually, or to feed in to some downstream application/processes, as needed.

**Step 6: Clone the Fronend in order to upload the invoice to s3 via an interface**<br>
Click on the sub-repository named 'Frontend' or click [here]("http://github.com/charansoneji/Flipkart-Grid-Invoice-Processor/tree/master/Frontend/"). Clone the repo and make sure to install packages `express`, `aws-sdk` and `jade`. You can then run the command `node app.js` but you can find further instructions in the README given in that folder. <br>

**Step 7: Test the API and retrieve all data in required format**<br>
So after you have uploaded the file to the S3 bucket using the frontend from Step 6, open the subrepository named Retrieve data and run the Python notebook.In case, you do not use Jupyter Notebook, you can run it on a normal python IDE but make sure to have these modules installed
  - JSON
  - Pandas
  - Xlsxwriter
  - requests
  - openpysql<br>
You may use `pip` to install these libaries or could also use `conda install` to get these libraries installed.
Once you have opened the notebook named "Output to Excel.ipynb" or "Output to Excel.py", run the cells individually or run the entire file. You will be asked to enter a fiename. So enter the name of the file which you have just uploaded. Make sure to check the suffix of the file i.e. ".pdf" at the end.
###### Note: We have set up a file criteria of 4MB. This means that from the frontend, when you try to upload a file of size greater than 4MB, an error will be thrown instantly and you will not be allowed to upload the file.
Please note that you may also use POSTMAN in order to verify the given links and obtain all the data in the form of JSON. The links that you would have to use are given below:
- Table data: https://deployment-id.execute-api.us-east-1.amazonaws.com/demo/retrievedocumentanalysisresult?Bucket=your-bucket-name&Document=your-document-key&ResultType=TABLE
- Form data: https://deployment-id.execute-api.us-east-1.amazonaws.com/demo/retrievedocumentanalysisresult?Bucket=your-bucket-name&Document=your-document-key&ResultType=FORM
- All existing data on invoice: https://deployment-id.execute-api.us-east-1.amazonaws.com/demo/retrievedocumentanalysisresult?Bucket=your-bucket-name&Document=your-document-key&ResultType=ALL

## SECTION B - Testing the project
This is the easy step, all the config files containing the Secret Access Key and Access key ID has been set up. 
- You need to clone the "Frontend" subrepository along with the "Retrieve data" repository. You can click [here]("https://github.com/charansoneji/Flipkart-Grid-Invoice-Processor/blob/master/Frontend/README.md") in order to get the steps on how to install the front end. A few dependencies are required which can be eaily installed using NPM. which have been mentioned above in Step 6.
- The next step would be to run the Frontend
- Upload the required S3 file using the interface given but *make sure to remember the filename* and *verify if the filesize is lesser than 4MB*.
- Once you have received the upload success, wait for a couple of minutes before running the Output to Excel notbook or python file. and you should be able to see an excel sheet labelles as *invoice.xlsx* in the same directory.
- In case you are using **POSTMAN** in order to obtain the results, use the REST API links given and copy the AWS credentials and mention them in the authentication section given [here]("https://github.com/charansoneji/Flipkart-Grid-Invoice-Processor/blob/master/Frontend/config.json").

**Step 8: Get the json data to the actual invoice template excel sheet**<br>
So, once we get the link, the user can run one python file that is available [here](https://github.com/charansoneji/Flipkart-Grid-Invoice-Processor/tree/master/Retrieve%20Data).
The user has to input the link and then all the details will be seen in the **invoice.xlsx**. There are 4 steps that will be taking place when you run the python file.
- The form data that is present in the json format will be extracted and added in a temporary excel sheet, named Sheet2.xlsx.
- Then the data from the temporary sheet will be automatically added to the **invoice.xlsx** according to the "if" conditions mentioned in the code. These conditions can always be edited for future invoices with different templates.
- Then we'll move on to the tabular data available. The tabular data will be available in the json format just like the form data. So again we will extract the required data from the json link and then save it in a temporary temporary excel sheet, named Sheet1.xlsx.
- Now again the data from that temporary sheet will be automatically added to the **invoice.xlsx** according to the "if" conditions mentioned in the code. And even these conditions can always be edited for future invoices with different templates.
- After running the code, when you open **invoice.xlsx**, you will be able to see all the data that has been extracted and added in the excel sheet.<br>
I hope this helps you!
