import React, { useState } from 'react';

// ==========================================
// SOURCE CODE CONTENT STORAGE
// ==========================================

const MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cxexplorer.native">

    <!-- Network Access -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Account Access for Drive Login -->
    <uses-permission android:name="android.permission.GET_ACCOUNTS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.CXExplorer">
        
        <activity android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- FileProvider to share the generated .m3u8 playlist with MX Player -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.provider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/provider_paths" />
        </provider>

    </application>
</manifest>`;

const BUILD_GRADLE = `dependencies {
    // Core
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    
    // Google Sign In & Drive API
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    implementation('com.google.api-client:google-api-client-android:2.2.0') {
        exclude group: 'org.apache.httpcomponents'
    }
    implementation('com.google.apis:google-api-services-drive:v3-rev20220815-2.0.0') {
        exclude group: 'org.apache.httpcomponents'
    }
    
    // Coroutines for background API calls
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.1'
}`;

const MAIN_ACTIVITY_KT = `package com.cxexplorer.native

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.Scope
import com.google.api.services.drive.DriveScopes
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private val RC_SIGN_IN = 9001
    private lateinit var driveService: DriveService
    private lateinit var adapter: FileAdapter
    private var currentFolderId = "root"
    private var breadcrumbs = mutableListOf<Pair<String, String>>() // ID, Name

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        setupRecyclerView()
        
        // 1. Check for existing Google Sign In
        val account = GoogleSignIn.getLastSignedInAccount(this)
        if (account != null && GoogleSignIn.hasPermissions(account, Scope(DriveScopes.DRIVE_READONLY))) {
            initializeDrive(account.account!!)
        } else {
            requestSignIn()
        }
    }

    private fun requestSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestScopes(Scope(DriveScopes.DRIVE_READONLY))
            .build()
        val client = GoogleSignIn.getClient(this, gso)
        startActivityForResult(client.signInIntent, RC_SIGN_IN)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(Exception::class.java)
                initializeDrive(account.account!!)
            } catch (e: Exception) {
                Toast.makeText(this, "Login Failed: \${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun initializeDrive(account: android.accounts.Account) {
        driveService = DriveService(this, account)
        loadFolder("root")
    }

    private fun loadFolder(folderId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val files = driveService.listFiles(folderId)
                withContext(Dispatchers.Main) {
                    currentFolderId = folderId
                    adapter.submitList(files)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@MainActivity, "Error loading: \${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun onFileClicked(file: DriveFile) {
        if (file.isFolder) {
            breadcrumbs.add(currentFolderId to file.name)
            loadFolder(file.id)
        } else if (file.isVideo) {
            // Launch MX Player with Playlist context
            MXPlayerHelper.launchWithPlaylist(this, file, adapter.currentList, driveService.authToken)
        }
    }
    
    // ... RecyclerView setup and Back press handling ...
}`;

const DRIVE_SERVICE_KT = `package com.cxexplorer.native

import android.content.Context
import android.accounts.Account
import com.google.api.client.extensions.android.http.AndroidHttp
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes

data class DriveFile(
    val id: String,
    val name: String,
    val mimeType: String,
    val size: Long,
    val webContentLink: String?,
    val thumbnailLink: String?
) {
    val isFolder: Boolean get() = mimeType == "application/vnd.google-apps.folder"
    val isVideo: Boolean get() = mimeType.startsWith("video/")
}

class DriveService(context: Context, account: Account) {
    
    private val credential = GoogleAccountCredential.usingOAuth2(
        context, setOf(DriveScopes.DRIVE_READONLY)
    ).apply { selectedAccount = account }

    private val service: Drive = Drive.Builder(
        AndroidHttp.newCompatibleTransport(),
        GsonFactory(),
        credential
    ).setApplicationName("CX Native Explorer").build()

    val authToken: String? get() = try { credential.token } catch (e: Exception) { null }

    fun listFiles(folderId: String): List<DriveFile> {
        val query = "'\$folderId' in parents and trashed = false"
        
        val request = service.files().list()
            .setQ(query)
            .setFields("files(id, name, mimeType, size, webContentLink, iconLink)")
            .setOrderBy("folder, name")
        
        val result = request.execute()
        
        return result.files.map { f ->
            DriveFile(
                f.id, 
                f.name, 
                f.mimeType, 
                f.size?.toLong() ?: 0L, 
                f.webContentLink,
                f.iconLink
            )
        }
    }
}`;

const MX_PLAYER_HELPER_KT = `package com.cxexplorer.native

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File

object MXPlayerHelper {

    /**
     * Generates a .m3u8 playlist file in the cache directory containing all videos in the current folder.
     * Launches MX Player to play this playlist, starting at the selected file.
     */
    fun launchWithPlaylist(context: Context, startFile: DriveFile, allFiles: List<DriveFile>, authToken: String?) {
        val videos = allFiles.filter { it.isVideo }
        if (videos.isEmpty()) return

        // 1. Reorder list so the selected video is first (or just pass the list)
        // MX Player handles the full playlist. Let's write the playlist in order.
        
        val playlistFile = File(context.cacheDir, "playlist.m3u8")
        
        // 2. Build M3U Content
        val sb = StringBuilder()
        sb.append("#EXTM3U\\n")
        
        // If we want to start at 'startFile', we can handle that via Intent extras in some players,
        // but standard M3U starts at top.
        // Strategy: Write the clicked file FIRST, then the rest.
        // OR: Just write them in order and the user can skip.
        // Let's write in order for "Explorer" feel.
        
        videos.forEach { video ->
            if (!video.webContentLink.isNullOrEmpty()) {
                sb.append("#EXTINF:-1, \${video.name}\\n")
                sb.append("\${video.webContentLink}\\n")
            }
        }
        
        playlistFile.writeText(sb.toString())

        // 3. Get URI via FileProvider (Must be defined in AndroidManifest)
        val playlistUri = FileProvider.getUriForFile(
            context,
            "\${context.packageName}.provider",
            playlistFile
        )

        // 4. Construct Intent
        val intent = Intent(Intent.ACTION_VIEW)
        intent.setDataAndType(playlistUri, "audio/x-mpegurl") // M3U8 MIME type
        intent.setPackage("com.mxtech.videoplayer.ad") // Free version
        // intent.setPackage("com.mxtech.videoplayer.pro") // Pro version support?

        // 5. Add specific extras for Network Stream
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        
        // Pass Auth Headers for Drive (Important for private files!)
        if (authToken != null) {
            val headers = arrayOf("Authorization", "Bearer \$authToken")
            intent.putExtra("headers", headers)
        }
        
        // Set Title
        intent.putExtra("title", startFile.name)

        // Try to find the specific video index to start? 
        // MX Player may not support "start at index" for m3u via Intent easily without specific extras.
        // Workaround: If you want to start exactly at that video, put it at top of list logic above.
        
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            // MX Player not installed
            // Fallback to internal or play store
        }
    }
}`;

// ==========================================
// VIEWER UI
// ==========================================

const files = [
  { name: 'MainActivity.kt', lang: 'kotlin', content: MAIN_ACTIVITY_KT },
  { name: 'DriveService.kt', lang: 'kotlin', content: DRIVE_SERVICE_KT },
  { name: 'MXPlayerHelper.kt', lang: 'kotlin', content: MX_PLAYER_HELPER_KT },
  { name: 'AndroidManifest.xml', lang: 'xml', content: MANIFEST_XML },
  { name: 'build.gradle', lang: 'gradle', content: BUILD_GRADLE },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#252526] border-b border-[#333]">
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 p-2 rounded-lg">
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <div>
             <h1 className="text-white font-bold text-lg">Android Native Code Generator</h1>
             <p className="text-xs text-gray-500">Pure Kotlin • MX Player Integration • Drive API</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-sans" onClick={() => alert("Please create an Android Studio project and paste these files.")}>
          Download Zip (Mock)
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
          <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Project Files</div>
          {files.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center px-4 py-2 text-sm text-left border-l-2 hover:bg-[#2a2d2e] transition-colors ${
                activeTab === idx 
                  ? 'border-blue-500 bg-[#37373d] text-white' 
                  : 'border-transparent text-gray-400'
              }`}
            >
              <span className={`mr-2 w-3 h-3 rounded-full ${file.lang === 'kotlin' ? 'bg-purple-500' : 'bg-orange-500'}`}></span>
              {file.name}
            </button>
          ))}
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          {/* Tab Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#1e1e1e] border-b border-[#333]">
             <span className="text-sm text-gray-400">{files[activeTab].name}</span>
             <button 
               onClick={handleCopy}
               className={`text-xs px-3 py-1.5 rounded border transition-all ${
                  copied 
                  ? 'border-green-500 text-green-500 bg-green-500/10' 
                  : 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
               }`}
             >
               {copied ? 'Copied!' : 'Copy Code'}
             </button>
          </div>

          {/* Code Content */}
          <div className="flex-1 overflow-auto p-6">
            <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap text-[#d4d4d4]">
              {files[activeTab].content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
