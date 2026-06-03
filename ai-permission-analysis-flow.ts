
'use server';
/**
 * @fileOverview An AI agent for analyzing Android source code and suggesting necessary manifest permissions.
 *
 * - aiPermissionAnalysis - A function that handles the Android permission analysis process.
 * - AiPermissionAnalysisInput - The input type for the aiPermissionAnalysis function.
 * - AiPermissionAnalysisOutput - The return type for the aiPermissionAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema: Defines the structure for the source code files to be analyzed.
const AiPermissionAnalysisInputSchema = z.object({
  files: z.array(z.object({
    filename: z.string().describe('The name of the source code file.'),
    content: z.string().describe('The full content of the source code file.'),
  })).describe('An array of Android source code files to analyze.'),
});
export type AiPermissionAnalysisInput = z.infer<typeof AiPermissionAnalysisInputSchema>;

// Output Schema: Defines the structure for the suggested Android permission IDs.
const AiPermissionAnalysisOutputSchema = z.array(
  z.string().describe('An Android permission ID, e.g., "INTERNET", "CAMERA".')
).describe('A list of suggested Android permission IDs required by the analyzed source code.');
export type AiPermissionAnalysisOutput = z.infer<typeof AiPermissionAnalysisOutputSchema>;

const aiPermissionAnalysisPrompt = ai.definePrompt({
  name: 'aiPermissionAnalysisPrompt',
  input: {schema: AiPermissionAnalysisInputSchema},
  output: {schema: AiPermissionAnalysisOutputSchema},
  prompt: `You are an expert Android security analyst. Your task is to analyze the provided Android source code files and identify which Android manifest permissions are required.

Review the following source code snippets. Based on API calls, class usage, or explicit mentions, determine the necessary permissions.

Here is a list of common Android permission IDs and their descriptions. You must only suggest permission IDs from this list or similar standard Android permissions if absolutely necessary. Do NOT include the "android.permission." prefix in your output. For example, if "android.permission.INTERNET" is needed, return "INTERNET". Only include unique permissions that are directly implied by the code.

Available Android Permission IDs and their descriptions:
- INTERNET: Allows apps to open network sockets.
- ACCESS_NETWORK_STATE: Allows apps to access information about networks.
- ACCESS_WIFI_STATE: Allows apps to access information about Wi-Fi networks.
- CAMERA: Required to be able to access the camera device.
- RECORD_AUDIO: Allows an application to record audio.
- VIBRATE: Allows access to the vibrator.
- FLASHLIGHT: Allows access to the flashlight.
- BLUETOOTH: Allows apps to connect to paired bluetooth devices.
- READ_EXTERNAL_STORAGE: Allows apps to read from external storage.
- WRITE_EXTERNAL_STORAGE: Allows apps to write to external storage.
- MANAGE_EXTERNAL_STORAGE: Allows apps to manage access to external storage.
- ACCESS_FINE_LOCATION: Allows an app to access precise location.
- ACCESS_COARSE_LOCATION: Allows an app to access approximate location.
- ACCESS_BACKGROUND_LOCATION: Allows an app to access location in the background.
- READ_CONTACTS: Allows an application to read the user's contacts data.
- WRITE_CONTACTS: Allows an application to write the user's contacts data.
- READ_CONTACTS: Allows an application to read the user's contacts data.
- WRITE_CONTACTS: Allows an application to write the user's contacts data.
- READ_CALL_LOG: Allows an application to read the user's call log.
- SEND_SMS: Allows an application to send SMS messages.
- RECEIVE_SMS: Allows an application to receive SMS messages.
- READ_PHONE_STATE: Allows read only access to phone state.
- USE_BIOMETRIC: Allows an app to use biometric hardware.
- USE_FINGERPRINT: Allows an app to use fingerprint hardware.
- FOREGROUND_SERVICE: Allows an app to use foreground services.
- RECEIVE_BOOT_COMPLETED: Allows an application to receive the ACTION_BOOT_COMPLETED that is broadcast after the system finishes booting.
- WAKE_LOCK: Allows using PowerManager WakeLocks to keep processor from sleeping or screen from dimming.
- POST_NOTIFICATIONS: Allows an app to post notifications.
- SCHEDULE_EXACT_ALARM: Allows an app to use exact alarms.
- BILLING: Allows an application to make in-app purchases.

Source Code Files:
{{#each files}}
--- {{filename}} ---
\`\`\`
{{{content}}}
\`\`\`
{{/each}}

JSON Output:`,
});

const aiPermissionAnalysisFlow = ai.defineFlow(
  {
    name: 'aiPermissionAnalysisFlow',
    inputSchema: AiPermissionAnalysisInputSchema,
    outputSchema: AiPermissionAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await aiPermissionAnalysisPrompt(input);
    return output!;
  }
);

export async function aiPermissionAnalysis(input: AiPermissionAnalysisInput): Promise<AiPermissionAnalysisOutput> {
  return aiPermissionAnalysisFlow(input);
}
