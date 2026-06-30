// this function takes a normal password and turns it into a scrambled hash
// we store the hash in the database instead of the real password
// so even if someone opens the database, they can't read the actual password
export async function hashPassword(password) {
    // turn the password text into bytes first
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // ask the browser to hash those bytes using SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // the hash comes back as raw bytes, so we turn it into a normal text string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

    return hashHex;
}