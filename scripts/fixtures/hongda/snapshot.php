<?php
// Local-only backup helper. Not a production plugin or a public download route.
if (!defined('NEW_SITE_REFERENCE_LAB')) { return; }
add_action('rest_api_init', static function (): void {
    register_rest_route('hongda-lab/v1', '/snapshot', [
        'methods'=>'POST',
        'permission_callback'=>static fn(): bool => current_user_can('manage_options'),
        'callback'=>static function () {
            if (!defined('FQDB') || FQDB !== '/wordpress/wp-content/database/.ht.sqlite' || !class_exists('SQLite3')) {
                return new WP_Error('unsupported_database','This helper only supports the verified local SQLite path.',['status'=>409]);
            }
            $id=gmdate('Ymd-His').'-'.bin2hex(random_bytes(5));
            $dir='/artifacts/snapshots/'.$id;
            if (!wp_mkdir_p($dir)) return new WP_Error('snapshot_directory','Cannot create private snapshot directory.',['status'=>500]);
            chmod($dir,0700);
            try {
                $source=new SQLite3(FQDB,SQLITE3_OPEN_READONLY);
                $target=new SQLite3($dir.'/database.sqlite',SQLITE3_OPEN_READWRITE|SQLITE3_OPEN_CREATE);
                if (!$source->backup($target)) throw new RuntimeException('SQLite consistent backup failed');
                if ($target->querySingle('PRAGMA integrity_check')!=='ok') throw new RuntimeException('SQLite integrity check failed');
                $target->close();$source->close();chmod($dir.'/database.sqlite',0600);
                $zip=new ZipArchive();
                if ($zip->open($dir.'/uploads.zip',ZipArchive::CREATE|ZipArchive::EXCL)!==true) throw new RuntimeException('Cannot create uploads archive');
                $uploads=wp_upload_dir()['basedir'];
                $files=[];
                if(is_dir($uploads))foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($uploads,FilesystemIterator::SKIP_DOTS)) as $file){
                    if($file->isLink())throw new RuntimeException('Upload symlink unsupported');
                    if(!$file->isFile())continue;
                    $relative=substr($file->getPathname(),strlen($uploads)+1);
                    $zip->addFile($file->getPathname(),$relative);
                    $files[]=['path'=>$relative,'sha256'=>hash_file('sha256',$file->getPathname())];
                }
                if(!$zip->close())throw new RuntimeException('Cannot finish uploads archive');
                chmod($dir.'/uploads.zip',0600);
                $receipt=['id'=>$id,'createdAt'=>gmdate('c'),'wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'permalinkStructure'=>get_option('permalink_structure'),'databaseSha256'=>hash_file('sha256',$dir.'/database.sqlite'),'uploadsSha256'=>hash_file('sha256',$dir.'/uploads.zip'),'uploads'=>$files,'scope'=>'local-sqlite-only'];
                file_put_contents($dir.'/export.json',wp_json_encode($receipt,JSON_PRETTY_PRINT));
                return $receipt;
            }catch(Throwable $e){return new WP_Error('snapshot_failed',$e->getMessage(),['status'=>500]);}
        },
    ]);
});
