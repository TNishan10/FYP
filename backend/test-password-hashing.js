import { hashPassword, comparePassword } from './helpers/authHelper.js';

// Test function
const testPasswordHashing = async () => {
  try {
    console.log('Testing password hashing functions...');
    
    const password = 'SecurePassword123!';
    
    // Test 1: Hash a password
    console.log('Test 1: Hashing password...');
    const hash1 = await hashPassword(password);
    console.log('Generated hash:', hash1);
    
    // Test 2: Verify a password against its hash
    console.log('\nTest 2: Verifying password against hash...');
    const isMatch = await comparePassword(password, hash1);
    console.log('Password match:', isMatch);
    
    // Test 3: Hash the same password again (should be different due to salt)
    console.log('\nTest 3: Hashing same password again...');
    const hash2 = await hashPassword(password);
    console.log('Hash 1:', hash1);
    console.log('Hash 2:', hash2);
    console.log('Hashes are different:', hash1 !== hash2);
    
    // Test 4: Verify the password against the second hash
    console.log('\nTest 4: Verifying password against second hash...');
    const isMatch2 = await comparePassword(password, hash2);
    console.log('Password match:', isMatch2);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the tests
testPasswordHashing();