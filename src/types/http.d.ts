declare module 'http' {
    interface IncomingMessage {
        body: Buffer;
    }
}