import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptDemo {
    
    public static void main(String[] args) {
        // Test both technician hashes from database
        String[] bcryptHashes = {
            "$2a$10$CfGkzEzADlBwGIbdOVC5yeLvqeVVLdnFUydP8NPO4mhqyLjtkKqxyux" // tech_mmc_2
        };
        
        // Create encoder
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("Testing bcrypt hash matching:");
        System.out.println();
        
        // Check each user and password combination
        for (int i = 0; i < bcryptHashes.length; i++) {
            System.out.println("Hash: " + bcryptHashes[i]);
            boolean matches = encoder.matches("", bcryptHashes[i]);
            System.out.println("  Password '" + "" + "' matches: " + matches);
        }
    }
}
