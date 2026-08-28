"""
Demo Case Generator for MEDAI BLACK BOX
Creates sample medical images for testing and demonstration
"""
import numpy as np
from PIL import Image
import os

def create_brain_tumor_image(case_type='glioma', size=224):
    """
    Create synthetic brain MRI-like image
    
    case_type: 'high_confidence_robust', 'high_confidence_uncertain', 'low_confidence'
    """
    img = np.ones((size, size, 3), dtype=np.uint8) * 80  # Brain background
    
    cy, cx = size // 2, size // 2
    y, x = np.ogrid[:size, :size]
    
    if case_type == 'high_confidence_robust':
        # Clear, well-defined tumor
        mask1 = (x - cx)**2 + (y - cy)**2 <= (size // 4)**2
        img[mask1] = [200, 100, 100]  # Reddish tumor
        mask2 = (x - cx - 40)**2 + (y - cy + 30)**2 <= (size // 6)**2
        img[mask2] = [220, 120, 120]
        
    elif case_type == 'high_confidence_uncertain':
        # Tumor with unclear boundaries
        mask = (x - cx)**2 + (y - cy)**2 <= (size // 3.5)**2
        img[mask] = [150, 120, 100]  # Blurred tumor
        # Add some noise
        noise = np.random.normal(0, 10, (size, size, 3))
        img = np.clip(img.astype(float) + noise, 0, 255).astype(np.uint8)
        
    elif case_type == 'low_confidence':
        # Ambiguous case
        mask1 = (x - cx + 30)**2 + (y - cy - 30)**2 <= (size // 5)**2
        img[mask1] = [140, 110, 90]
        mask2 = (x - cx - 30)**2 + (y - cy + 30)**2 <= (size // 5)**2
        img[mask2] = [130, 100, 80]
        noise = np.random.normal(0, 15, (size, size, 3))
        img = np.clip(img.astype(float) + noise, 0, 255).astype(np.uint8)
    
    return img

def create_demo_cases():
    """Create and save demo cases"""
    output_dir = 'demo_cases'
    os.makedirs(output_dir, exist_ok=True)
    
    cases = {
        'case_001_robust.png': {
            'type': 'high_confidence_robust',
            'name': 'High Confidence, Robust Prediction',
            'description': 'A clear case where the model is confident and stable under perturbation'
        },
        'case_002_uncertain.png': {
            'type': 'high_confidence_uncertain',
            'name': 'High Confidence, Uncertain Prediction',
            'description': 'High confidence but uncertain under perturbation testing'
        },
        'case_003_ambiguous.png': {
            'type': 'low_confidence',
            'name': 'Low Confidence Edge Case',
            'description': 'Borderline case with competing predictions'
        }
    }
    
    for filename, case_info in cases.items():
        img_array = create_brain_tumor_image(case_info['type'])
        img = Image.fromarray(img_array)
        filepath = os.path.join(output_dir, filename)
        img.save(filepath)
        print(f"✓ Created {filename}: {case_info['name']}")
    
    # Create metadata
    with open(os.path.join(output_dir, 'metadata.json'), 'w') as f:
        import json
        json.dump(cases, f, indent=2)
    
    print(f"\n✓ Demo cases created in {output_dir}/")
    return output_dir

if __name__ == '__main__':
    create_demo_cases()
