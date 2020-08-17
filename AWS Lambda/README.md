# AWS Lambda functions
The following functions are defined in order to process the information everytime an invoice is deposited in the S3 bucket. <br>
Lambda functions used in this solution prototype uses a common execution role that allows it to assume the role, to which required policies are attached.<br>
Some of the functions used are:
- A Lambda function, named `TextractAsyncJobSubmitFunction` is used to invoke both DocumentAnalysis and TextDetection API calls to Textract. Several environment variables are passed to this function:
- `document_analysis_token_prefix`: an unique string used to identify the document analysis jobs. This is used alongwith the bucket and document name to indicate to Textract the uniqueness of submissions. Based on this, Textract either runs a fresh job or responds with a job-id generated during a prior submission of same document.
- `text_detection_token_prefix`: an unique string used to identify the text detection jobs. This is used alongwith the bucket and document name to indicate to Textract the uniqueness of submissions. Based on this, Textract either runs a fresh job or responds with a job-id generated during a prior submission of same document.
- `document_analysis_topic_arn`: Specifies the SNS topic to which job completion messages for document analysis jobs will be posted.
- `text_detection_topic_arn`: Specifies the SNS topic to which job completion messages for text detection jobs will be posted.
- `role_name`: Textract service role to which policies allowing message publication to the two previously mentioned topics are added.
- `retry_interval`: Value in seconds specifying how long the function should wait if a submission fails. When lot of submission requests arrive within a short time, either through exposed Rest API, or due to bulk upload of documents to S3 bucket, Textract API throughput exceeds. By waiting for a certain interval before retrying another attempted submission ensures that all documents gets their turn to be processed.
- `max_retry_attempt`: Sometimes, due to large volume of requests, some might keep failing consistently. By specifying a maximum number of attempts, the solution allows us to gracefully exit out of the processing pipeleine. This feature, alongwith tracking metadata in DynamoDB table can then be used to manually submit the request later, using the Rest API interface.

There are 3 separate Lambda functions, all triggered when job completion messages are posted by Textract to the respective SNS topics.<br>
**A Lambda function, named `TextractPostProcessTableFunction` is triggered when a DocumentAnalysis job completion message is posted to `DocumentAnalysisJobStatusTopic`. Once invoked,  this function executes following actions:**
 - Obtain unique Job-Id and Document location from the posted message
 - Retrieve result of the analysis using get_document_analysis API
 - Parses the JSON dictionary from Textract response to extract all Table and Cell Blocks as a list of key value maps
 - Convert each map of Table and Cell blocks to generate an XML structure, using HTML tags to indicate tables, rows and columns
 - Save the extracted tables as one HTML file each under a upload folder marked by the job-id, created underneath the document location folder in the same S3 bucket
 - Update the DynamoDB record for the correpsonding JobId and JobType with completion information, result metadata (number of tables and pages), and the location on S3 bucket where the resulting files are uploaded. <br>
**A Lambda function, named `TextractPostProcessFormFunction` is triggered when a DocumentAnalysis job completion message is posted to `DocumentAnalysisJobStatusTopic`. Once invoked, this function executes following actions:**
  - Obtain unique Job-Id and Document location from the posted message
  - Retrieve result of the analysis using get_document_analysis API
  - Groups all blocks present in the Textract response by block types, and selects all Keys and Values having child relationships
  - Gather all identified key-value pairs in a JSON dictionary
  - Save the JSON dictionary with key-value mappings as a file under a upload folder marked by the job-id, created underneath the document location folder in the same S3 bucket
  - Update the DynamoDB record for the correpsonding JobId and JobType with completion information, result metadata (number of form fields ), and the location on S3 bucket where the resulting file is uploaded. <br>
**A Lambda function, named `TextractPostProcessTextFunction` is triggered when a TextDetection job completion message is posted to `TextDetectionJobStatusTopic`. Once invoked, this function executes following actions:**
 - Obtain unique Job-Id and Document location from the posted message
 - Retrieve result of the analysis using get_document_text_detection API
 - Groups all blocks present in the Textract response by block types, and captures all texts by selecting all Line type blocks that are present as children of Page type blocks
 - Gather all identified lines of texts as a JSON dictionary with Line number being the key and Line text the value
 - These dictionary elements are nested within outer dictionary with Page number as keys
 - Save the extracted lines as JSON file under a upload folder marked by the job-id, created underneath the document location folder in the same S3 bucket
 - Update the DynamoDB record for the correpsonding JobId and JobType with completion information, result metadata (number of pages and lines), and the location on S3 bucket where the resulting files are uploaded.
