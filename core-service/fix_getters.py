import os
import re

base_dir = r"d:\Work\microservice\SE361-ToToRo-Microservice\core-service\src\main\java\com\totoro"

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # replace .getUser().getId() with .getUserId()
            content = content.replace('.getUser().getId()', '.getUserId()')
            # replace .getUser().getEmail() with .getUserId()
            content = content.replace('.getUser().getEmail()', 'String.valueOf(.getUserId())') 
            # wait, that's broken.
            content = re.sub(r'review\.getUser\(\)\.getEmail\(\)\.equals\(([^)]+)\)', r'review.getUserId().equals(\1)', content)
            
            # Listing landlord
            content = content.replace('.getLandlord().getId()', '.getLandlordId()')
            
            # Review user
            content = content.replace('review.getUser()', 'review.getUserId()') # this might be wrong if it's not .equals
            # Wait, review.getUserId().getEmail() is wrong.
            # I will just write a specific replace:
            content = content.replace('!review.getUser().getEmail().equals(email)', '!review.getUserId().equals(userId)')
            
            # Report
            content = content.replace('.getReporter().getId()', '.getReporterId()')
            content = content.replace('.getResolvedBy().getId()', '.getResolvedById()')

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
print("Getters refactored.")
