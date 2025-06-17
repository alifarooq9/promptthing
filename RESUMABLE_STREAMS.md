# Resumable Streams Implementation

This implementation adds resumable stream functionality to the chat application, allowing users to resume interrupted chat streams seamlessly.

## Features Added

### 1. Server-side Resumable Streams
- **Stream Context Management**: Uses `createResumableStreamContext` to manage resumable streams
- **Stream ID Tracking**: Each chat stream gets a unique ID stored in the database
- **Resume Endpoint**: GET `/api/v1/chat?chatId=<id>` allows resuming streams
- **Fallback Handling**: If a stream can't be resumed, returns the last completed message

### 2. Database Schema Updates
Added `streamIds` table to track stream IDs for each chat:
```typescript
streamIds: defineTable({
  chatId: v.id("chat"),
  streamId: v.string(),
})
.index("by_chatId", ["chatId"])
.index("by_streamId", ["streamId"])
```

### 3. Client-side Auto-Resume
- **Auto-Resume Hook**: Automatically attempts to resume streams on chat load
- **DataStreamHandler**: Component that handles stream resumption
- **Time-based Logic**: Only attempts resume for messages created within 30 seconds

## How It Works

### Stream Creation (POST)
1. Generate unique stream ID
2. Save stream ID to database
3. Create resumable stream with `streamContext.resumableStream()`
4. Return stream response

### Stream Resumption (GET)
1. Validate chat access
2. Get latest stream ID for chat
3. Attempt to resume with `streamContext.resumableStream()`
4. If no active stream, return last completed message if recent

### Client-side Resume
1. `DataStreamHandler` automatically attempts resume on mount
2. `useAutoResume` hook checks for incomplete messages
3. Only resumes if last message is recent (< 30 seconds)

## Configuration

### Redis Setup (Optional)
To enable resumable streams, set up Redis:

```bash
# Add to .env.local
REDIS_URL=redis://localhost:6379
```

Without Redis, streams will work but won't be resumable across server restarts.

### Environment Variables
The system gracefully falls back when Redis is not available:
- Streams work normally without resumability
- Console message indicates resumable streams are disabled

## Usage

### Automatic Resume
The system automatically handles stream resumption:
- User refreshes page during streaming → Stream resumes
- Network interruption → Stream resumes when reconnected
- Server restart with Redis → Stream can be resumed

### Manual Testing
1. Start a chat with a long response
2. Refresh the page during streaming
3. The stream should resume automatically

## Technical Details

### Stream ID Generation
- Uses `crypto.randomUUID()` for unique IDs
- Stored in database with chat association
- Retrieved by chat ID for resumption

### Time-based Validation
- Only resumes streams for recent messages (< 15 seconds on server, < 30 seconds on client)
- Prevents resuming very old incomplete messages

### Error Handling
- Graceful fallback when Redis unavailable
- Returns empty stream when no resumable stream found
- Logs errors for debugging

## Files Modified

### Server-side
- `app/api/v1/chat/route.ts` - Added resumable stream logic
- `convex/schema.ts` - Added streamIds table
- `convex/chat.ts` - Added stream ID management functions

### Client-side
- `components/chat.tsx` - Added experimental_resume support
- `hooks/use-auto-resume.ts` - Auto-resume logic
- `components/data-stream-handler.tsx` - Stream resumption component
- Chat pages - Added DataStreamHandler

### Dependencies
- `resumable-stream` - Already included in package.json
- `date-fns` - For time calculations
- `ai` SDK - Updated usage for experimental_resume

## Benefits

1. **Better UX**: Users don't lose progress on interrupted streams
2. **Reliability**: Handles network issues gracefully
3. **Performance**: Avoids re-generating completed content
4. **Scalability**: Works across server instances with Redis
