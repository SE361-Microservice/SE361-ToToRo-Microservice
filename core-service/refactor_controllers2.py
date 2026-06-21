import os
import re

base_dir = r"d:\Work\microservice\SE361-ToToRo-Microservice\core-service\src\main\java\com\totoro"

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('Controller.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            content = re.sub(r'import org\.springframework\.security\..*?;\n', '', content)
            content = re.sub(r'import com\.totoro\.auth\..*?;\n', '', content)
            content = re.sub(r'@PreAuthorize\(.*?\)\n', '', content)
            
            # Change controller method arguments
            content = re.sub(r'Authentication\s+authentication', r'@RequestHeader("X-User-Id") Long userId', content)
            content = re.sub(r'@AuthenticationPrincipal\s+CustomUserDetails\s+[a-zA-Z0-9_]+', r'@RequestHeader("X-User-Id") Long userId', content)

            # Change method body
            content = re.sub(r'authentication\.getName\(\)', 'userId', content)
            content = re.sub(r'[a-zA-Z0-9_]+\.getUsername\(\)', 'userId', content)

            if '@RequestHeader' not in content:
                content = content.replace('import org.springframework.web.bind.annotation.*;', 'import org.springframework.web.bind.annotation.*;\nimport org.springframework.web.bind.annotation.RequestHeader;')

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
print("Controllers refactored.")
