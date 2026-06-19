import os
import re

base_dir = r"d:\Work\microservice\SE361-ToToRo-Microservice\core-service\src\main\java\com\totoro"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove security imports
    content = re.sub(r'import org\.springframework\.security\..*?;\n', '', content)
    content = re.sub(r'import com\.totoro\.auth\..*?;\n', '', content)

    # Remove @PreAuthorize
    content = re.sub(r'@PreAuthorize\(.*?\)\n', '', content)

    # Replace Authentication authentication and @AuthenticationPrincipal CustomUserDetails userDetails
    # with @RequestHeader("X-User-Id") Long userId
    content = re.sub(r'Authentication\s+authentication', r'@RequestHeader("X-User-Id") Long userId', content)
    content = re.sub(r'@AuthenticationPrincipal\s+CustomUserDetails\s+\w+', r'@RequestHeader("X-User-Id") Long userId', content)
    
    # Replace authentication.getName() and userDetails.getUsername() with userId
    content = re.sub(r'authentication\.getName\(\)', 'userId', content)
    content = re.sub(r'\w+\.getUsername\(\)', 'userId', content) # usually userDetails.getUsername()
    content = re.sub(r'\w+\.getId\(\)', 'userId', content) # if userDetails.getId() was used

    # Replace String email with Long userId in service calls
    content = re.sub(r'String\s+email', 'Long userId', content)

    # Note: We still need to manually fix some service implementations, but this fixes the controller side.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.java'):
            process_file(os.path.join(root, file))

print("Controllers and Security annotations refactored.")
