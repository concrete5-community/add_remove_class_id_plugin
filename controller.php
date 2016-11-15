<?php
namespace Concrete\Package\AddRemoveClassIdPlugin;

use Concrete\Core\Editor\Plugin;
use \Core;
use \AssetList;

/*
Add and Remove Classes and IDs by Karl Dilkington (aka MrKDilkington)
This software is licensed under the terms described in the concrete5.org marketplace.
Please find the add-on there for the latest license copy.
*/

class Controller extends \Concrete\Core\Package\Package
{

    protected $pkgHandle = 'add_remove_class_id_plugin';
    protected $appVersionRequired = '5.7.5.2';
    protected $pkgVersion = '0.9.5';

    public function getPackageDescription()
    {
        return t('Add and remove classes and IDs in the rich text editor.');
    }

    public function getPackageName()
    {
        return t('Add and Remove Classes and IDs');
    }

    public function on_start()
    {
        $al = AssetList::getInstance();
        $al->register(
            'javascript', 'editor/plugin/add_remove_class_id', 'js/redactor/add_remove_class_id.js',
            array(), 'add_remove_class_id_plugin'
        );
        $al->register(
            'css', 'editor/plugin/add_remove_class_id', 'css/redactor/add_remove_class_id.css',
            array(), 'add_remove_class_id_plugin'
        );
        $al->registerGroup('editor/plugin/add_remove_class_id', array(
            array('javascript', 'editor/plugin/add_remove_class_id'),
            array('css', 'editor/plugin/add_remove_class_id')
        ));

        $plugin = new Plugin();
        $plugin->setKey('add_remove_class_id');
        $plugin->setName(t('Add and Remove Classes and IDs'));
        $plugin->requireAsset('editor/plugin/add_remove_class_id');

        Core::make('editor')->getPluginManager()->register($plugin);
    }

}