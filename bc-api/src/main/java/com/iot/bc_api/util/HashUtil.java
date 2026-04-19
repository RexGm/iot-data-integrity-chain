package com.iot.bc_api.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utility class for SHA-256 hashing operations
 */
public class HashUtil {

    private static final String ALGORITHM = "SHA-256";

    /**
     * Generate SHA-256 hash for given data
     *
     * @param data Input data to hash
     * @return SHA-256 hash in hexadecimal format
     * @throws RuntimeException if SHA-256 algorithm is not available
     */
    public static String generateSHA256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance(ALGORITHM);
            byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Convert byte array to hexadecimal string
     *
     * @param bytes Byte array to convert
     * @return Hexadecimal representation
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
