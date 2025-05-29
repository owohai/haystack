import random
import string

def generate_random_key(length=39):
    allowed_chars = string.ascii_letters + string.digits + "-_"
    return ''.join(random.choices(allowed_chars, k=length))

for _ in range(1):
    print(generate_random_key())