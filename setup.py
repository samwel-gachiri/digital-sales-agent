#!/usr/bin/env python3
"""
Digital Sales Agent Setup Script

This script helps set up the Digital Sales Agent system by:
1. Checking prerequisites
2. Setting up environment files
3. Installing dependencies
4. Providing setup instructions
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def check_python_version():
    """Check if Python 3.13+ is installed"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 13):
        print("❌ Python 3.13+ is required")
        print(f"   Current version: {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor} detected")
    return True

def check_node_version():
    """Check if Node.js 18+ is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip().replace('v', '')
            major_version = int(version.split('.')[0])
            if major_version >= 18:
                print(f"✅ Node.js {version} detected")
                return True
            else:
                print(f"❌ Node.js 18+ is required (found {version})")
                return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def check_uv():
    """Check if uv is installed"""
    try:
        result = subprocess.run(['uv', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ uv detected: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        print("❌ uv not found - installing...")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'uv'], check=True)
            print("✅ uv installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install uv")
            return False

def setup_env_files():
    """Setup environment files from samples"""
    print("\n📝 Setting up environment files...")
    
    env_files = [
        ('Coral-SalesAgent/.env_sample', 'Coral-SalesAgent/.env'),
        ('Coral-SalesInterfaceAgent/.env_sample', 'Coral-SalesInterfaceAgent/.env'),
        ('SalesUI/.env.local.example', 'SalesUI/.env.local')
    ]
    
    for sample, target in env_files:
        if os.path.exists(sample) and not os.path.exists(target):
            shutil.copy2(sample, target)
            print(f"✅ Created {target}")
        elif os.path.exists(target):
            print(f"⚠️  {target} already exists - skipping")
        else:
            print(f"❌ {sample} not found")

def install_python_dependencies():
    """Install Python dependencies for all agents"""
    print("\n📦 Installing Python dependencies...")
    
    python_projects = [
        'Coral-SalesAgent',
        'Coral-SalesInterfaceAgent'
    ]
    
    for project in python_projects:
        if os.path.exists(f"{project}/pyproject.toml"):
            print(f"Installing dependencies for {project}...")
            try:
                subprocess.run(['uv', 'sync'], cwd=project, check=True)
                print(f"✅ {project} dependencies installed")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {project} dependencies")
        else:
            print(f"❌ {project}/pyproject.toml not found")

def install_node_dependencies():
    """Install Node.js dependencies for the frontend"""
    print("\n📦 Installing Node.js dependencies...")
    
    if os.path.exists("SalesUI/package.json"):
        try:
            subprocess.run(['npm', 'install'], cwd='SalesUI', check=True)
            print("✅ Frontend dependencies installed")
        except subprocess.CalledProcessError:
            print("❌ Failed to install frontend dependencies")
    else:
        print("❌ SalesUI/package.json not found")

def print_setup_instructions():
    """Print final setup instructions"""
    print("\n" + "=" * 60)
    print("🎉 Setup Complete!")
    print("=" * 60)
    
    print("\n📋 Next Steps:")
    print("\n1. Configure API Keys:")
    print("   Edit the following files with your API keys:")
    print("   - Coral-SalesAgent/.env")
    print("   - Coral-SalesInterfaceAgent/.env")
    print("   - SalesUI/.env.local")
    
    print("\n2. Start Coral Server:")
    print("   Follow the Coral Server setup guide:")
    print("   https://github.com/Coral-Protocol/coral-server")
    
    print("\n3. Start the Agents:")
    print("   # Terminal 1 - Sales Agent")
    print("   cd Coral-SalesAgent")
    print("   uv run python main.py")
    print("")
    print("   # Terminal 2 - Sales Interface Agent")
    print("   cd Coral-SalesInterfaceAgent")
    print("   uv run python main.py")
    print("")
    print("   # Terminal 3 - Frontend")
    print("   cd SalesUI")
    print("   npm run dev")
    
    print("\n4. Setup Existing Agents:")
    print("   You'll also need to setup and run:")
    print("   - Coral-FirecrawlMCP-Agent")
    print("   - Coral-OpenDeepResearch-Agent")
    print("   - Coral-VoiceInterface-Agent")
    print("   - Coral-Pandas-Agent")
    
    print("\n5. Access the Application:")
    print("   - Frontend: http://localhost:3000")
    print("   - API: http://localhost:8000")
    print("   - Coral Server: http://localhost:8080")
    
    print("\n6. Run Demo:")
    print("   python demo.py")
    
    print("\n📚 Documentation:")
    print("   See README.md for detailed setup and usage instructions")

def main():
    """Main setup function"""
    print("🎯 Digital Sales Agent Setup")
    print("=" * 40)
    
    print("\n🔍 Checking prerequisites...")
    
    # Check prerequisites
    checks = [
        check_python_version(),
        check_node_version(),
        check_uv()
    ]
    
    if not all(checks):
        print("\n❌ Prerequisites not met. Please install missing requirements.")
        sys.exit(1)
    
    # Setup environment files
    setup_env_files()
    
    # Install dependencies
    install_python_dependencies()
    install_node_dependencies()
    
    # Print instructions
    print_setup_instructions()

if __name__ == "__main__":
    main()