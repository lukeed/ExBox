# ExBox

> A resusable, pre-packaged Vagrant box for easy Elixir development.

**WIP** - not ready for use yet

## Install

```
npm install -g exbox
```

## Usage

```
$ exbox 

  Usage
    $ exbox [command] [options]
  
  Commands
    setup      Setup ExBox for the first time
    domain     Map a Domain to a VM directory
    folder     Map a Local directory to the VM
    *          Run `vagrant -h` for additional commands

  Examples
    $ exbox setup
    $ exbox folder ~/code/project /home/vagrant/code/project
    $ exbox domain phoenix.dev /home/vagrant/code/project
    $ exbox reload
    $ exbox ssh
```

## License

MIT © [Luke Edwards](https://lukeed.com)
