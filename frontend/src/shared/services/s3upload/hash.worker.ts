// Web Crypto API kullanarak dosyayı okur ve hash'ler.
self.onmessage = async (e: MessageEvent<{ file: File, id: string }>) => {
    const { file, id } = e.data;
    try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        self.postMessage({ id, hash: hashHex, success: true });
    } catch (error) {
        self.postMessage({ id, success: false, error });
    }
};