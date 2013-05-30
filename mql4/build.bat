@echo off

rem ###############################################################################
rem #                                                                             #
rem # VitoshaTrade is Distributed Artificial Neural Network trained by            #
rem # Differential Evolution for prediction of Forex. Project development is in   #
rem # Sofia, Bulgaria. Vitosha is a mountain massif, on the outskirts of Sofia,   #
rem # the capital of Bulgaria.                                                    #
rem #                                                                             #
rem # Copyright (C) 2008-2009 by Todor Balabanov  ( tdb@tbsoft.eu )               #
rem #                            Iliyan Zankinski ( iliyan_mf@abv.bg )            #
rem #                            Galq Cirkalova   ( galq_cirkalova@abv.bg )       #
rem #                            Ivan Grozev      ( ivan.iliev.grozev@gmail.com ) #
rem #                                                                             #
rem # This program is free software: you can redistribute it and/or modify        #
rem # it under the terms of the GNU General Public License as published by        #
rem # the Free Software Foundation, either version 3 of the License, or           #
rem # (at your option) any later version.                                         #
rem #                                                                             #
rem # This program is distributed in the hope that it will be useful,             #
rem # but WITHOUT ANY WARRANTY; without even the implied warranty of              #
rem # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               #
rem # GNU General Public License for more details.                                #
rem #                                                                             #
rem # You should have received a copy of the GNU General Public License           #
rem # along with this program. If not, see <http://www.gnu.org/licenses/>.        #
rem #                                                                             #
rem ###############################################################################

rem ############################################################################
rem # Check input parameters.                                                  #
rem ############################################################################
if "%~1"=="" goto end
if "%~2"=="" goto end

rem ############################################################################
rem # Go to start build directory.                                             #
rem ############################################################################
rem %~d3
rem cd %~dp3

rem ############################################################################
rem # Create web root directories.                                             #
rem ############################################################################
md "%~dp2common\"
md "%~dp2logic\"
md "%~dp2images\"

rem ############################################################################
rem # Deploy server side scripts. The parameter %2 PHP Apache htdocs folder.   #
rem ############################################################################
del "%~dp2common\*.php"
del "%~dp2logic\*.php"
copy ..\server\common\*.php "%~dp2common\"
copy ..\server\logic\*.php "%~dp2logic\"

rem ############################################################################
rem # Deploy website scripts. The parameter %2 PHP Apache htdocs folder.       #
rem ############################################################################
del "%~dp2images\*.jpg"
del "%~dp2images\*.png"
del "%~dp2\*.php"
del "%~dp2\*.php3"
del "%~dp2\*.css"
copy ..\website\images\*.jpg "%~dp2images\"
copy ..\website\images\*.png "%~dp2images\"
copy ..\website\*.php3 "%~dp2"
copy ..\website\*.css "%~dp2"
rename "%~dp2\*.php3" *.php
del "%~dp2\*.php3"

rem ############################################################################
rem # Change working directory to binaries.                                    #
rem ############################################################################
md binaries
cd binaries

rem ############################################################################
rem # Clean to binaries directory.                                             #
rem ############################################################################
del *.o
del *.a
del *.def
del VitoshaTrade.dll

rem ############################################################################
rem # Compiling.                                                               #
rem ############################################################################
SET INCLUDES = -I../../client/source/
g++ %INCLUDES% -c ../../client/source/*.cpp -DBUILDING_DLL=1
g++ %INCLUDES% -c ../source/*.cpp -DBUILDING_DLL=1

rem ############################################################################
rem # Linking.                                                                 #
rem ############################################################################
ar rcs libVitoshaTrade.a *.o
dllwrap --output-def VitoshaTrade.def *.o ../libraries/libws2_32.a ../libraries/libpdh.a --no-export-all-symbols --add-stdcall-alias -o VitoshaTrade.dll -lstdc++

rem ############################################################################
rem # Deploy binaries. The parameter %~dp1 is MT4 install folder.              #
rem ############################################################################
copy *.dll "%~dp1experts\libraries\"
copy ..\include\*.mqh "%~dp1experts\include\"
copy ..\source\*.mq4 "%~dp1experts\indicators\"

rem ############################################################################
rem # Clean to binaries directory.                                             #
rem ############################################################################
del *.o
del *.a
del *.def
del VitoshaTrade.dll

rem ############################################################################
rem # Compile Java based back end system.                                      #
rem ############################################################################
md ..\..\backend\binaries
cd ..\..\backend\binaries\
javac -d .\ ..\source\*.java
jar cvf VitoshaTradeUnsigned.jar *.class
jarsigner -keystore ..\keys\VitoshaTrade -storepass VitoshaTrade -keypass VitoshaTrade -signedjar VitoshaTrade.jar VitoshaTradeUnsigned.jar VitoshaTrade

rem ############################################################################
rem # Depoly Java based back end system.                                       #
rem ############################################################################
del "%~dp2\VitoshaTrade.jar"
del "%~dp2\VitoshaTrade.cer"
del "%~dp2\*.html"
copy .\VitoshaTrade.jar "%~dp2"
copy ..\keys\VitoshaTrade.cer "%~dp2"
copy ..\source\*.html "%~dp2"

rem ############################################################################
rem # Clean to binaries directory.                                             #
rem ############################################################################
del *.class
del *.jar

rem ############################################################################
rem # Build indicator. The parameter %~d1 is MT4 install drive.                #
rem ############################################################################
%~d1
cd "%~dp1experts\indicators\"
"%~dp1MetaLang.exe" VitoshaTrade.mq4

rem ############################################################################
rem # End of the srcipt if there are no input parameters.                      #
rem ############################################################################
:end

rem ############################################################################
rem # Stop screen.                                                             #
rem ############################################################################
pause

@echo on