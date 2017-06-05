#!/usr/local/bin/python

"""
This displays the currently open app on an Nvidia ShieldTV (or any android tv) in openHAB2 for the purposes of enabling app specific automation.
Specifically this is working on a Pi3 running openhabian.
You need to enable adb access on the Shield TV, and install adb on the pi.
sudo apt-get install android-tools-adb
Enable "Developer Mode" on the device, enable "USB Debugging" and "Network Debugging"
Copy this script onto your server and make readable and executable to the same user that’s running OpenHAB, chmod 755 is usually a safe bet
OH Item: String androidApp "Current App [%s]" <app> (home)
OH Thing: Thing exec:command:androidApp [command="/usr/bin/python /etc/openhab2/scripts/androidTVFocus.py", interval=900, timeout=30, autorun=true]
Adapted from here: https://github.com/onikiforov/scripts/blob/488165eeea33d70e156d9dfde645e553c2d705af/android_screen.py

ADB Debugging must be enabled.
Example output strings are below. The .replace options shorten these to the app name alone. Shown in ()
com.plexapp.android (plex)
com.google.android.leanbacklauncher (leanbacklauncher)
com.netflix.ninja (netflix)
com.google.android.youtube.tv (youtube)
"""

import re
import sys
import subprocess

def execute_shell(command, working_directory=None, stdout=None, stderr=None):
    p = subprocess.Popen([command], cwd=working_directory, shell=True, stdout=stdout, stderr=stderr)
    if stderr:
        stdout, stderr = p.communicate()
        return stdout, stderr
    elif stdout:
        output = p.stdout.read()
        return output
    else:
        p.wait()

# Get current activity and grab package name from it: adb shell dumpsys window windows | grep -E 'mCurrentFocus'
activity_info = execute_shell("adb shell dumpsys window windows | grep -E 'mCurrentFocus'", stdout=subprocess.PIPE)

pattern = 'u0 (.*)\/.*\.(.*)}'

try:
    app_name = re.search(pattern, activity_info).group(1).strip().replace(".", "").replace(" ", "").replace("com", "").replace("ninja", "").replace("android", "").replace("google", "").replace("tv", "").replace("app", "")
except Exception:
    app_name = ""

print(app_name)
