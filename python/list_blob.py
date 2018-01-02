#!/usr/bin/python

#Install the package if it doesn't exist
#pip install azure-storage-blob

#the keys are stored in /etc/eugenie/config.json

from azure.storage.blob import BlockBlobService, ContentSettings
import json

def load_config(config_file):
	with open(config_file) as data_file:    
		data = json.load(data_file)
	access_key = data["azure"]["azureStorageAccessKey"]
	account = data["azure"]["azureStorageAccount"]
	endpoint = data["azure"]["azureEndpoint"]
	return access_key,account,endpoint

def list_blob(block_blob_service,container):
	generator = block_blob_service.list_blobs(container)
	print "\nThe following blobs are present in {0}".format(container)
	for blob in generator:
		print blob.name

def upload_blob(block_blob_service, container, blob_name, image_name):
	print "\nUploading {0} to {1} as {2} from python\n".format(
		image_name, container, blob_name)
	block_blob_service.create_blob_from_path(
	container,
	blob_name,
	image_name,
	content_settings=ContentSettings(content_type='image/png')
		)

def main():
	config_file="/etc/eugenie/config.json"
	access_key,account,endpoint = load_config(config_file)

	block_blob_service = BlockBlobService(\
	account_name=account, account_key=access_key)
	container = "year-end-party"
	
	print "Before uploading"
	list_blob(block_blob_service, container)
	upload_blob(block_blob_service, container, "nyc.png", "nyc.png")
	
	print "After uploading"
	list_blob(block_blob_service, container)


if __name__ == '__main__':
	main()