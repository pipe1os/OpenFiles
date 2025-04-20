# Adding New Conversion Types

This guide explains how to add support for converting a new type of file (e.g., converting fonts from TTF to WOFF2) to the OpenFiles application.

The project uses a modular approach, with separate Firebase Cloud Functions for each main conversion category and corresponding configurations in the frontend.

## 1. Backend Implementation

All backend code resides in the [`backend/functions/`](mdc:backend/functions/) directory.

### 1.1. Install Dependencies

Identify and install any necessary Node.js libraries for performing the conversion. Navigate to the functions directory and install them:

```bash
cd backend/functions
npm install name-of-conversion-library --save
# Install TypeScript types if available
npm install @types/name-of-conversion-library --save-dev
cd ../.. # Return to project root
```

### 1.2. Create Converter File

Create a new TypeScript file for your converter logic within [`backend/functions/src/`](mdc:backend/functions/src/), following the naming convention:

`backend/functions/src/newTypeConverter.ts`

(Replace `newType` with the category name, e.g., `fontConverter.ts`)

### 1.3. Implement the `onCall` Cloud Function

Inside your new file, implement an `export const convertNewType = functions.https.onCall(async (data, context) => { ... });` function.

Follow the pattern established in other converters like [`imageConverter.ts`](mdc:backend/functions/src/imageConverter.ts) or [`videoConverter.ts`](mdc:backend/functions/src/videoConverter.ts):

- **Imports:** Include necessary modules (`firebase-functions`, `firebase-admin`, `os`, `path`, `fs`, your conversion library).
- **Get Bucket:** `const bucket = admin.storage().bucket();`
- **Define Constants:** Create a `Set` for `SUPPORTED_OUTPUT_FORMATS` specific to this converter.
- **Extract Data:** Get `filePath`, `outputFormat`, `options` from `data.data`.
- **Backend Validations:**
  - Check if `filePath` and `outputFormat` are valid strings.
  - Check if `outputFormat` is in your `SUPPORTED_OUTPUT_FORMATS`.
  - (Optional) Validate any specific `options` received.
  - Check if the source file exists in Storage: `const [exists] = await bucket.file(filePath).exists();`
  - **Throw `functions.https.HttpsError`** for any validation failures with appropriate codes (`invalid-argument`, `not-found`) and messages.
- **Define Paths:** Set up temporary input/output paths using `os.tmpdir()` and `path.join()`, and the final destination path in Storage (usually `converted/your-output-filename`).
- **Try/Catch/Finally Block:**
  - **Try:**
    1. Download the file from Storage to the temporary input path (`await bucket.file(filePath).download(...)`).
    2. Perform the conversion using your chosen library, saving to the temporary output path.
    3. Upload the converted file from the temporary output path to the destination path in Storage (`await bucket.upload(...)`). Include appropriate `metadata.contentType`.
    4. Return a success object: `{ message: "Success!", originalFile: filePath, convertedFile: targetStoragePath }`.
  - **Catch:**
    - Log the error (`functions.logger.error(...)`).
    - Throw a `functions.https.HttpsError` (usually with code `internal` unless you can determine a more specific cause).
  - **Finally:**
    - Clean up both temporary input and output files using `fs.promises.unlink(path).catch(...)`.

### 1.4. Export the Function

Open [`backend/functions/src/index.ts`](mdc:backend/functions/src/index.ts) and add an export line for your new function:

```typescript
// ... other exports
export { convertNewType } from "./newTypeConverter";
```

### 1.5. Configure `firebase.json`

Open the root [`firebase.json`](mdc:firebase.json) file. Inside the `functions` object, add an entry for your new function, specifying its memory and timeout requirements. Conversions can be resource-intensive, so consider appropriate values (e.g., 512MiB/1GiB memory, 120s/300s/540s timeout).

```json
{
  "functions": {
    // ... other function definitions
    "convertNewType": {
      "memory": "512MiB",
      "timeoutSeconds": 120
    }
  }
  // ... rest of firebase.json
}
```

## 2. Frontend Integration

All frontend code resides in the [`frontend/`](mdc:frontend/) directory.

### 2.1. Update `conversionTypes.ts`

Open [`frontend/src/config/conversionTypes.ts`](mdc:frontend/src/config/conversionTypes.ts). Add a new object to the `conversionTypes` array for your new category:

```typescript
export const conversionTypes: ConversionCategory[] = [
  // ... other categories
  {
    label: "NewType (e.g., Font TTF/OTF)", // User-friendly label
    value: "newType", // Lowercase identifier
    acceptedMimeTypes: ["mime/type1", "mime/type2"], // MIME types this category accepts
    outputOptions: [
      { value: "outputExt1", label: "EXT1" }, // e.g., { value: "woff2", label: "WOFF2" }
      { value: "outputExt2", label: "EXT2" },
      // Add specific OptionsComponent if needed
    ],
  },
];
```

Make sure the `label`, `value`, `acceptedMimeTypes`, and `outputOptions` are accurate for your new type.

### 2.2. Update `conversionService.ts`

Open [`frontend/src/services/conversionService.ts`](mdc:frontend/src/services/conversionService.ts).

1.  Add a new asynchronous function `triggerNewTypeConversion` following the pattern of the others. Use `httpsCallable` to target the backend function name (`convertNewType`).

    ```typescript
    const triggerNewTypeConversion = async (
      filePath: string,
      outputFormat: string,
      options?: ConversionOptions
    ): Promise<ConversionSuccessResponse> => {
      console.log("Calling newType function (onCall)...");
      console.log("Data sent:", { filePath, outputFormat, options });
      try {
        const convertNewType = httpsCallable<
          ConversionRequestData,
          ConversionSuccessResponse
        >(functions, "convertNewType");
        const result = await convertNewType({
          filePath,
          outputFormat,
          options,
        });
        console.log("newType function response:", result.data);
        return result.data;
      } catch (error) {
        console.error("Error calling newType conversion function:", error);
        throw error; // Re-throw for HomePage to handle
      }
    };
    ```

2.  Add your new function to the final `export` statement at the bottom of the file.

### 2.3. Update `HomePage.tsx`

Open [`frontend/src/pages/HomePage.tsx`](mdc:frontend/src/pages/HomePage.tsx).

1.  Import your new trigger function (e.g., `triggerNewTypeConversion`) from `conversionService` at the top.
2.  Inside the `handleConvertClick` function, find the `if/else if` block that calls the different trigger functions based on `selectedCategoryValue`.
3.  Add a new `else if` condition for your category's `value`:

    ```typescript
    // ... inside handleConvertClick try block
    } else if (selectedCategoryValue === "newType") {
        result = await triggerNewTypeConversion(
          uploadedFilePath,
          selectedFormat,
          conversionOptions,
        );
    } else {
      // ... existing fallback error
    }
    ```

### 2.4. (Optional) Add Options Component

If your conversion type requires specific user options (like quality for JPG), you would:

1.  Create a new React component in `frontend/src/components/core/options/` (e.g., `NewTypeOptions.tsx`). This component would receive `options` and `onOptionChange` as props.
2.  Import this component in [`frontend/src/config/conversionTypes.ts`](mdc:frontend/src/config/conversionTypes.ts).
3.  Reference it in the `outputOptions` where appropriate: `{ value: "outputExt1", label: "EXT1", OptionsComponent: NewTypeOptions }`.
4.  [`frontend/src/components/core/OptionsPanel.tsx`](mdc:frontend/src/components/core/OptionsPanel.tsx) should automatically render it based on the configuration.

## 3. Testing

Always test your changes locally using the Firebase Emulators:

```bash
# In one terminal (from project root)
npm run build --prefix backend/functions # Build backend changes
firebase emulators:start --only functions,storage

# In another terminal (from project root)
cd frontend
npm run dev
```

Test uploading a file of the new type, selecting the new category and output formats, performing the conversion, and downloading the result.
