# Bazaar

## Usage

### importProducts

```shell
serverless invoke local --function importProducts --data '{"category": "<category>", "spreadsheetId": "<spreadsheetId>"}'
```

This will fetch the given spreadsheet and save all products to Cloud Firestore.

### crawlProducts

```shell
serverless invoke local --function crawlProducts
```

This will fetch all products from Cloud Firestore, crawls information from Amazon.de and saves it back to Cloud Firestore.

### exportProducts

```shell
serverless invoke local --function exportProducts
```

This will fetch all records from Cloud Firestore and creates a new CSV out of it, located in `/exports` folder.
