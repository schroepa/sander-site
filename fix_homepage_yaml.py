import re

def main():
    with open('cms/user/pages/01.home/homepage.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('---', 2)
    
    yaml_part = parts[1]
    
    def replacer(match):
        raw_val = match.group(1)
        val = raw_val.replace('\\"', '"').replace('\\n', '\n')
        
        full_match = match.group(0)
        indent_len = full_match.index('content:')
        indentation = " " * indent_len
        
        lines = val.split('\n')
        res = " " * indent_len + "content: |\n"
        for line in lines:
            res += indentation + "  " + line + "\n"
        return res[:-1]
        
    new_yaml = re.sub(r'^[ \t]*content:\s*"((?:[^"\\]|\\["n]|(?:\n))*)"', replacer, yaml_part, flags=re.MULTILINE)
    
    parts[1] = new_yaml
    
    with open('cms/user/pages/01.home/homepage.md', 'w', encoding='utf-8') as f:
        f.write('---'.join(parts))
        
    print("Fixed YAML content successfully.")

if __name__ == '__main__':
    main()
