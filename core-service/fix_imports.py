import os

base_dir = r"d:\Work\microservice\SE361-ToToRo-Microservice\core-service\src\main\java\com\totoro"

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if '@RequestHeader' in content and 'import org.springframework.web.bind.annotation.RequestHeader;' not in content:
                content = content.replace('import org.springframework.web.bind.annotation.*;', 
                                          'import org.springframework.web.bind.annotation.*;\nimport org.springframework.web.bind.annotation.RequestHeader;')
                if 'import org.springframework.web.bind.annotation.RequestHeader;' not in content:
                     content = content.replace('import org.springframework.web.bind.annotation', 
                                          'import org.springframework.web.bind.annotation.RequestHeader;\nimport org.springframework.web.bind.annotation')

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Imports added.")
