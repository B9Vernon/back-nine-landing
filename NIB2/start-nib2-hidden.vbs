' Launches start-nib2.bat with no visible console window.
' Used by the "NIB2 Server" scheduled task so NIB2 comes up automatically
' at login, without a Command Prompt window cluttering the desktop.
Set fso = CreateObject("Scripting.FileSystemObject")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = folder
shell.Run """" & folder & "\start-nib2.bat""", 0, False
