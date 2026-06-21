import os
import re

base_dir = r"d:\Work\microservice\SE361-ToToRo-Microservice\core-service\src\main\java\com\totoro"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove user imports
    content = re.sub(r'import com\.totoro\.user\..*?;\n', '', content)
    # Remove auth/security imports
    content = re.sub(r'import org\.springframework\.security\..*?;\n', '', content)

    # In entities: replace @ManyToOne ... User user; with Long userId;
    # Specifically looking for User landlord, User reporter, User resolvedBy, User user
    
    # Replace User landlord
    content = re.sub(r'@ManyToOne.*?\n\s*@JoinColumn\(name\s*=\s*"landlord_id"\)\n\s*private User landlord;',
                     r'@Column(name = "landlord_id")\n    private Long landlordId;', content, flags=re.DOTALL)
    
    # Replace User user
    content = re.sub(r'@ManyToOne.*?\n\s*@JoinColumn\(name\s*=\s*"user_id"\)\n\s*private User user;',
                     r'@Column(name = "user_id")\n    private Long userId;', content, flags=re.DOTALL)
                     
    # Replace User reporter
    content = re.sub(r'@ManyToOne.*?\n\s*@JoinColumn\(name\s*=\s*"reporter_id"\)\n\s*private User reporter;',
                     r'@Column(name = "reporter_id")\n    private Long reporterId;', content, flags=re.DOTALL)

    # Replace User resolvedBy
    content = re.sub(r'@ManyToOne.*?\n\s*@JoinColumn\(name\s*=\s*"resolved_by"\)\n\s*private User resolvedBy;',
                     r'@Column(name = "resolved_by")\n    private Long resolvedById;', content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.java'):
            process_file(os.path.join(root, file))

print("Entities refactored.")
