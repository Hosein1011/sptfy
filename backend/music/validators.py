# backend/music/validators.py
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator

def validate_image_size(file):
    max_size_mb = 5
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Image file size cannot exceed {max_size_mb} MB.")

def validate_audio_size(file):
    max_size_mb = 50
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Audio file size cannot exceed {max_size_mb} MB.")

valid_image_extensions = FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])
valid_audio_extensions = FileExtensionValidator(allowed_extensions=['mp3', 'wav', 'flac', 'm4a'])