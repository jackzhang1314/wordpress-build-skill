<?php
namespace Hongda\Theme;
defined('ABSPATH') || exit;
function field(string $name, $id=false): string { $value=function_exists('get_field')?get_field($name,$id):''; return is_scalar($value)?(string)$value:''; }
